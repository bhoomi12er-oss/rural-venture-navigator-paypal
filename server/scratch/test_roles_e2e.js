/**
 * Role-Based Authentication & Portal Separation Test
 * Verifies Customer vs Entrepreneur role enforcement, route guards,
 * product management, PayPal checkout order flow, and feedback visibility.
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const feedbackRoutes = require('../routes/feedbackRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);

let server;
const TEST_PORT = 5088;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function req(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runRoleTests() {
  console.log('===========================================================');
  console.log('🧪 RUNNING ROLE-BASED AUTH & PORTAL SEPARATION TESTS');
  console.log('===========================================================');

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`Test API running on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    const timeSuffix = Date.now().toString().slice(-6);

    // 1. Register Customer Account
    console.log('Step 1: Registering Customer Account...');
    const customerPhone = `91${timeSuffix}01`;
    const custReg = await req('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunita Customer',
        phone: customerPhone,
        password: 'custpassword',
        role: 'customer'
      })
    });

    if (!custReg.ok || !custReg.data.success) {
      throw new Error('Customer registration failed: ' + JSON.stringify(custReg.data));
    }
    const customerToken = custReg.data.token;
    const customerUser = custReg.data.user;

    if (customerUser.role !== 'customer') {
      throw new Error(`Customer role mismatch! Expected 'customer', got '${customerUser.role}'`);
    }
    console.log(`✓ Customer registered: "${customerUser.name}", Verified Backend Role: "${customerUser.role}"`);

    // 2. Register Entrepreneur Account
    console.log('\nStep 2: Registering Entrepreneur / Shopkeeper Account...');
    const entrepreneurPhone = `91${timeSuffix}02`;
    const entReg = await req('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavita Entrepreneur',
        phone: entrepreneurPhone,
        password: 'entpassword',
        role: 'entrepreneur'
      })
    });

    if (!entReg.ok || !entReg.data.success) {
      throw new Error('Entrepreneur registration failed: ' + JSON.stringify(entReg.data));
    }
    const entrepreneurToken = entReg.data.token;
    const entrepreneurUser = entReg.data.user;

    if (entrepreneurUser.role !== 'entrepreneur') {
      throw new Error(`Entrepreneur role mismatch! Expected 'entrepreneur', got '${entrepreneurUser.role}'`);
    }
    console.log(`✓ Entrepreneur registered: "${entrepreneurUser.name}", Verified Backend Role: "${entrepreneurUser.role}"`);

    // 3. Test Login for Both Accounts & Verify Roles
    console.log('\nStep 3: Verifying Login & Auth Tokens for Both Roles...');
    const custLogin = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: customerPhone, password: 'custpassword' })
    });
    if (custLogin.data.user.role !== 'customer') throw new Error('Customer login role failure');

    const entLogin = await req('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: entrepreneurPhone, password: 'entpassword' })
    });
    if (entLogin.data.user.role !== 'entrepreneur') throw new Error('Entrepreneur login role failure');
    console.log('✓ Both logins verified: Customer gets role "customer", Entrepreneur gets role "entrepreneur"');

    // 4. Role Authorization: Customer must NOT be allowed to create or edit products
    console.log('\nStep 4: Testing Route Guard (Customer cannot access entrepreneur product endpoints)...');
    const custProductAttempt = await req('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        productName: 'Illegal Cookie',
        description: 'Should fail',
        category: 'cookies',
        price: 50,
        ingredients: 'Test'
      })
    });
    if (custProductAttempt.status !== 403) {
      throw new Error(`Security breach! Customer was not rejected with 403. Received: ${custProductAttempt.status}`);
    }
    console.log('✓ Route Guard passed: Customer blocked with 403 Forbidden from creating products');

    // 5. Entrepreneur Creates a New Product
    console.log('\nStep 5: Entrepreneur adds a new millet product to catalog...');
    const entCreateProd = await req('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${entrepreneurToken}`
      },
      body: JSON.stringify({
        productName: `Organic Ragi Crisps ${timeSuffix}`,
        description: 'Fresh organic finger millet crisps with himalayan salt',
        category: 'snacks',
        price: 45,
        ingredients: 'Ragi flour, Rice bran oil, Himalayan salt, Jeera',
        availableQuantity: 120
      })
    });
    if (!entCreateProd.ok || !entCreateProd.data.success) {
      throw new Error('Entrepreneur product creation failed: ' + JSON.stringify(entCreateProd.data));
    }
    const createdProduct = entCreateProd.data.product;
    console.log(`✓ Product created successfully: "${createdProduct.productName}" at ₹${createdProduct.price} (Stock: ${createdProduct.availableQuantity})`);

    // 6. Entrepreneur Edits the Product Stock & Price
    console.log('\nStep 6: Entrepreneur edits product price and stock...');
    const editProd = await req(`/api/products/${createdProduct._id || createdProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${entrepreneurToken}`
      },
      body: JSON.stringify({
        price: 42,
        availableQuantity: 150
      })
    });
    if (!editProd.ok || !editProd.data.success) throw new Error('Product edit failed: ' + JSON.stringify(editProd.data));
    console.log(`✓ Product updated: New price ₹${editProd.data.product.price}, New stock ${editProd.data.product.availableQuantity}`);

    // 7. Customer Purchases Product via PayPal Sandbox
    console.log('\nStep 7: Customer initiates and captures PayPal Sandbox order...');
    const createOrder = await req('/api/orders/create-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        items: [{ productId: createdProduct._id || createdProduct.id, quantity: 2 }]
      })
    });
    if (!createOrder.ok || !createOrder.data.success) throw new Error('Create PayPal order failed: ' + JSON.stringify(createOrder.data));
    console.log(`✓ PayPal Sandbox order initiated on server. Order ID: ${createOrder.data.orderID}, Trusted Total: ₹${createOrder.data.totalAmountINR}`);

    const captureOrder = await req('/api/orders/capture-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        orderID: createOrder.data.orderID,
        items: [{ productId: createdProduct._id || createdProduct.id, quantity: 2 }]
      })
    });
    if (!captureOrder.ok || !captureOrder.data.success) throw new Error('Capture order failed: ' + JSON.stringify(captureOrder.data));
    console.log(`✓ PayPal payment captured! Capture ID: ${captureOrder.data.captureId}`);

    // 8. Order Appears in Entrepreneur's Incoming Orders
    console.log('\nStep 8: Verifying order appears in the correct Shopkeeper\'s incoming orders...');
    const entOrders = await req('/api/orders', {
      headers: { Authorization: `Bearer ${entrepreneurToken}` }
    });
    if (!entOrders.ok || !entOrders.data.success) throw new Error('Entrepreneur orders fetch failed');
    const orderFound = entOrders.data.orders.find(o => o.paypalOrderId === createOrder.data.orderID);
    if (!orderFound) throw new Error('Order not found in entrepreneur orders!');
    if (orderFound.paymentStatus !== 'paid' || orderFound.paymentMethod !== 'paypal') {
      throw new Error('Order payment status incorrect in shopkeeper view');
    }
    console.log(`✓ Confirmed in Shopkeeper Orders: 2 units of "${createdProduct.productName}" from "${customerUser.name}", Status: Paid via PayPal (Capture: ${orderFound.paypalCaptureId})`);

    // 9. Customer Submits Review for the Product
    console.log('\nStep 9: Customer submits post-purchase review for the product...');
    const submitReview = await req('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        productId: createdProduct._id || createdProduct.id,
        rating: 5,
        wouldBuyAgain: true,
        priceReasonable: 'reasonable',
        comment: 'Crispy and wholesome! Loved the natural millet flavor.'
      })
    });
    if (!submitReview.ok || !submitReview.data.success) throw new Error('Feedback submission failed: ' + JSON.stringify(submitReview.data));
    console.log('✓ Customer review submitted successfully');

    // 10. Shopkeeper Views the Customer Review
    console.log('\nStep 10: Shopkeeper views customer feedback in their studio...');
    const entFeedback = await req('/api/feedback/my', {
      headers: { Authorization: `Bearer ${entrepreneurToken}` }
    });
    if (!entFeedback.ok || !entFeedback.data.success) throw new Error('Shopkeeper feedback fetch failed');
    const reviewFound = entFeedback.data.feedbacks.find(f => f.comment && f.comment.includes('Crispy and wholesome'));
    if (!reviewFound) throw new Error('Customer review not found in shopkeeper feedback dashboard');
    console.log(`✓ Confirmed in Shopkeeper Feedback Studio: 5-Star review ("${reviewFound.comment}") with repeat intent "${reviewFound.wouldBuyAgain}"`);

    console.log('\n===========================================================');
    console.log('🎉 ALL ROLE-BASED AUTH & PORTAL SEPARATION TESTS PASSED! 🎉');
    console.log('===========================================================');
  } finally {
    server.close();
  }
}

runRoleTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  if (err.cause) console.error('Cause:', err.cause);
  if (server) server.close();
  process.exit(1);
});
