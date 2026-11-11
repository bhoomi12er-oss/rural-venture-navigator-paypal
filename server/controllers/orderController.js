const Order = require('../models/Order');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');
const paypalUtil = require('../utils/paypal');

/**
 * Helper to fetch a product by ID from either MongoDB or mockStore
 */
const findProductById = async (id) => {
  if (global.dbConnected) {
    return await Product.findById(id);
  }
  return mockStore.findById('products', id);
};

/**
 * Public configuration endpoint for frontend PayPal SDK initialization
 * Only returns the public Client ID and configured currency - NEVER exposes the secret!
 */
const getPayPalConfig = async (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const currency = (process.env.PAYPAL_CURRENCY || 'USD').toUpperCase();
    const exchangeRate = parseFloat(process.env.EXCHANGE_RATE_INR_TO_USD || '0.012');
    const isConfigured = paypalUtil.isConfigured();

    res.status(200).json({
      success: true,
      clientId,
      currency,
      exchangeRate,
      isSandbox: (process.env.PAYPAL_MODE || 'sandbox').toLowerCase() === 'sandbox',
      isConfigured,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a PayPal Sandbox Order
 * Prices are strictly calculated on the server using trusted product data.
 * Client-submitted totals and prices are never trusted.
 */
const createPayPalOrder = async (req, res) => {
  try {
    // Support either cart items array: { items: [{ productId, quantity }] }
    // or single item purchase: { productId, quantity }
    let rawItems = [];
    if (Array.isArray(req.body.items) && req.body.items.length > 0) {
      rawItems = req.body.items;
    } else if (req.body.productId) {
      rawItems = [{ productId: req.body.productId, quantity: req.body.quantity || 1 }];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide items or product ID to create order',
      });
    }

    const currency = (process.env.PAYPAL_CURRENCY || 'USD').toUpperCase();
    const rate = parseFloat(process.env.EXCHANGE_RATE_INR_TO_USD || '0.012');

    const validatedItems = [];
    let calculatedTotalINR = 0;
    let calculatedTotalCurrency = 0;

    for (const item of rawItems) {
      if (!item.productId) {
        return res.status(400).json({ success: false, message: 'Each item must have a valid productId' });
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const product = await findProductById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} was not found`,
        });
      }

      // Check stock if availableQuantity is tracked
      if (typeof product.availableQuantity === 'number' && product.availableQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}. Available: ${product.availableQuantity}`,
        });
      }

      // TRUSTED PRICE CALCULATION
      const trustedPriceINR = Number(product.price);
      const itemTotalINR = trustedPriceINR * quantity;

      let unitPriceInCurrency;
      if (currency === 'INR') {
        unitPriceInCurrency = trustedPriceINR;
      } else {
        // Convert to USD (min 0.01 to ensure valid PayPal transaction)
        unitPriceInCurrency = Math.max(0.01, parseFloat((trustedPriceINR * rate).toFixed(2)));
      }

      const itemTotalInCurrency = parseFloat((unitPriceInCurrency * quantity).toFixed(2));

      calculatedTotalINR += itemTotalINR;
      calculatedTotalCurrency += itemTotalInCurrency;

      validatedItems.push({
        productId: String(product._id || product.id),
        productName: product.productName,
        entrepreneurId: String(product.entrepreneurId),
        quantity,
        trustedPriceINR,
        itemTotalINR,
        unitPriceInCurrency,
        itemTotalInCurrency,
      });
    }

    calculatedTotalCurrency = parseFloat(calculatedTotalCurrency.toFixed(2));

    // Call PayPal service to initiate checkout order
    const referenceId = `RVN_ORD_${Date.now()}`;
    const paypalOrder = await paypalUtil.createOrder({
      items: validatedItems,
      totalAmount: calculatedTotalCurrency,
      currency,
      referenceId,
      customData: {
        userId: String(req.user._id),
        itemCount: validatedItems.length,
      },
    });

    res.status(201).json({
      success: true,
      orderID: paypalOrder.id,
      currency,
      totalAmountCurrency: calculatedTotalCurrency,
      totalAmountINR: calculatedTotalINR,
      items: validatedItems,
      isMock: Boolean(paypalOrder.isMock),
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create PayPal order',
    });
  }
};

/**
 * Capture a PayPal Sandbox Order
 * Validates PayPal capture completion, then records the order in the database.
 * Does not mark order as completed until PayPal confirms capture.
 */
const capturePayPalOrder = async (req, res) => {
  const { orderID, items: clientItems } = req.body;

  if (!orderID) {
    return res.status(400).json({ success: false, message: 'orderID is required to capture payment' });
  }

  try {
    // 1. Capture payment via PayPal REST API
    const captureData = await paypalUtil.captureOrder(orderID);

    // 2. Strictly verify completion status from PayPal
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `PayPal payment not completed. Current status: ${captureData.status}`,
        details: captureData,
      });
    }

    // 3. Extract verified transaction details from PayPal capture response
    const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = captureUnit?.id || `CAP_${orderID}`;
    const payerEmail = captureData.payer?.email_address || 'buyer@sandbox.paypal.com';
    const payerGivenName = captureData.payer?.name?.given_name || '';
    const payerSurname = captureData.payer?.name?.surname || '';
    const payerName = `${payerGivenName} ${payerSurname}`.trim() || 'PayPal Buyer';
    const amountPaid = captureUnit?.amount?.value || '';
    const currency = captureUnit?.amount?.currency_code || (process.env.PAYPAL_CURRENCY || 'USD');

    // 4. Resolve items to record in the existing order system
    let itemsToProcess = [];
    if (Array.isArray(clientItems) && clientItems.length > 0) {
      itemsToProcess = clientItems;
    } else {
      // Fallback: check custom_id or payload if needed
      return res.status(400).json({
        success: false,
        message: 'Order items information missing from capture payload',
      });
    }

    const createdOrders = [];

    for (const item of itemsToProcess) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const product = await findProductById(item.productId);

      if (!product) {
        continue;
      }

      const trustedPrice = Number(product.price);
      const totalAmount = trustedPrice * quantity;

      const orderData = {
        customerId: req.user._id,
        entrepreneurId: product.entrepreneurId,
        productId: product._id || product.id,
        quantity,
        price: trustedPrice,
        totalAmount,
        orderStatus: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'paypal',
        paypalOrderId: orderID,
        paypalCaptureId: captureId,
        paypalPayerEmail: payerEmail,
        paypalDetails: {
          currency,
          amountPaid,
          payerName,
          payerEmail,
          rawStatus: captureData.status,
          capturedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      };

      let order;
      if (global.dbConnected) {
        order = await Order.create(orderData);
        // Decrement stock if tracked
        if (typeof product.availableQuantity === 'number') {
          await Product.findByIdAndUpdate(product._id, {
            $inc: { availableQuantity: -quantity },
          });
        }
      } else {
        order = mockStore.create('orders', orderData);
      }

      createdOrders.push(order);
    }

    res.status(200).json({
      success: true,
      message: 'Payment captured and orders recorded successfully',
      captureId,
      orderID,
      payerEmail,
      payerName,
      orders: createdOrders,
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to capture PayPal order',
    });
  }
};

/**
 * Legacy simulated single order creation for backward compatibility
 */
const placeOrder = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: 'Please provide product ID and quantity' });
  }

  try {
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const price = product.price;
    const totalAmount = price * Number(quantity);

    const orderData = {
      customerId: req.user._id,
      entrepreneurId: product.entrepreneurId,
      productId,
      quantity: Number(quantity),
      price,
      totalAmount,
      orderStatus: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'mock',
      paypalOrderId: null,
      paypalCaptureId: null,
    };

    let order;
    if (global.dbConnected) {
      order = await Order.create(orderData);
    } else {
      order = mockStore.create('orders', orderData);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch orders for current authenticated user (customer or entrepreneur)
 */
const getOrders = async (req, res) => {
  try {
    let orders;
    if (global.dbConnected) {
      if (req.user.role === 'entrepreneur') {
        orders = await Order.find({ entrepreneurId: req.user._id })
          .populate('customerId', 'name phone')
          .populate('productId', 'productName imageUrl category price')
          .sort({ createdAt: -1 });
      } else {
        orders = await Order.find({ customerId: req.user._id })
          .populate('productId', 'productName imageUrl category price')
          .populate('entrepreneurId', 'name phone')
          .sort({ createdAt: -1 });
      }
    } else {
      if (req.user.role === 'entrepreneur') {
        orders = mockStore.find('orders', { entrepreneurId: req.user._id });
      } else {
        orders = mockStore.find('orders', { customerId: req.user._id });
      }

      // Manually simulate Mongoose population for local JSON storage mode
      const users = mockStore.find('users', {});
      const products = mockStore.find('products', {});
      orders = orders.map((order) => {
        const customer = users.find((u) => String(u._id) === String(order.customerId));
        const product = products.find((p) => String(p._id) === String(order.productId));
        const seller = users.find((u) => String(u._id) === String(order.entrepreneurId));
        return {
          ...order,
          customerId: customer ? { _id: customer._id, name: customer.name, phone: customer.phone } : { name: 'Customer' },
          productId: product ? { _id: product._id, productName: product.productName, price: product.price, category: product.category } : { productName: 'Product' },
          entrepreneurId: seller ? { _id: seller._id, name: seller.name, phone: seller.phone } : { name: 'Seller' },
        };
      });

      // Sort recent first
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPayPalConfig,
  createPayPalOrder,
  capturePayPalOrder,
  placeOrder,
  getOrders,
};
