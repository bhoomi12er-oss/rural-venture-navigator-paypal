/**
 * End-to-End Integration Verification Script
 * Launches Express server, tests authentication, product fetching,
 * price calculation, PayPal order creation, and capture flow.
 */
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

// Setup test app instance
const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

let server;
const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, options);
  const json = await res.json();
  return { status: res.status, ok: res.ok, body: json };
}

async function runE2E() {
  console.log('--- Commencing End-to-End System Tests ---');

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server active on port ${TEST_PORT}`);
      resolve();
    });
  });

  try {
    // 1. Check Public PayPal Config
    console.log('\nStep 1: Checking PayPal Public Config...');
    const configRes = await request('/api/orders/paypal-config');
    if (!configRes.ok || !configRes.body.success) throw new Error('Config failed');
    if ('clientSecret' in configRes.body || 'PAYPAL_CLIENT_SECRET' in configRes.body) {
      throw new Error('SECURITY VIOLATION: Secret leaked in public endpoint!');
    }
    console.log('✓ Public config endpoint validated. Secret is strictly isolated.');

    // 2. Fetch Active Products
    console.log('\nStep 2: Fetching Active Products...');
    const productsRes = await request('/api/products');
    if (!productsRes.ok || !productsRes.body.success) throw new Error('Products fetch failed');
    const products = productsRes.body.products;
    if (!products || products.length === 0) throw new Error('No products found');
    console.log(`✓ Fetched ${products.length} products. Primary product: "${products[0].productName}" at ₹${products[0].price}`);

    // 3. Register / Login Test Customer
    console.log('\nStep 3: Authenticating Customer...');
    const uniquePhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anita Devi',
        phone: uniquePhone,
        password: 'password123',
        role: 'customer'
      })
    });
    if (!regRes.ok || !regRes.body.success) throw new Error('Registration failed: ' + JSON.stringify(regRes.body));
    const token = regRes.body.token;
    console.log(`✓ Registered customer "${regRes.body.user.name}" with token.`);

    // 4. Test Trusted Server Pricing & PayPal Order Creation
    console.log('\nStep 4: Testing Order Creation with Trusted Price Calculation...');
    const testProd = products[0];
    const qty = 3;
    const createRes = await request('/api/orders/create-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            productId: testProd._id || testProd.id,
            quantity: qty,
            price: 1, // Malicious client attempt to set price to 1 INR
            totalAmount: 1
          }
        ]
      })
    });

    if (!createRes.ok || !createRes.body.success) {
      throw new Error('Create order failed: ' + JSON.stringify(createRes.body));
    }

    const expectedTotalINR = testProd.price * qty;
    if (createRes.body.totalAmountINR !== expectedTotalINR) {
      throw new Error(`Price tampering allowed! Expected ₹${expectedTotalINR}, got ₹${createRes.body.totalAmountINR}`);
    }
    console.log(`✓ Server calculated trusted price: ₹${expectedTotalINR} (Tampered price was rejected). Order ID: ${createRes.body.orderID}`);

    // 5. Test PayPal Capture Confirmation & DB Recording
    console.log('\nStep 5: Testing Capture Confirmation & Order Recording...');
    const captureRes = await request('/api/orders/capture-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderID: createRes.body.orderID,
        items: [
          {
            productId: testProd._id || testProd.id,
            quantity: qty
          }
        ]
      })
    });

    if (!captureRes.ok || !captureRes.body.success) {
      throw new Error('Capture failed: ' + JSON.stringify(captureRes.body));
    }
    console.log(`✓ Payment successfully captured with Capture ID: ${captureRes.body.captureId}`);

    // 6. Verify Customer Order History
    console.log('\nStep 6: Verifying Order History & Payment Details...');
    const ordersRes = await request('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!ordersRes.ok || !ordersRes.body.success) throw new Error('Order list fetch failed');
    const userOrder = ordersRes.body.orders.find(o => o.paypalOrderId === createRes.body.orderID);
    if (!userOrder) throw new Error('Captured order not found in user orders list');
    if (userOrder.paymentStatus !== 'paid') throw new Error(`Incorrect paymentStatus: ${userOrder.paymentStatus}`);
    if (userOrder.paymentMethod !== 'paypal') throw new Error(`Incorrect paymentMethod: ${userOrder.paymentMethod}`);
    console.log(`✓ Customer order history verified: Order for "${userOrder.productId?.productName}" is status "${userOrder.orderStatus}", paymentStatus "${userOrder.paymentStatus}" with PayPal Capture ID "${userOrder.paypalCaptureId}".`);

    console.log('\n======================================================');
    console.log('🎉 ALL END-TO-END PAYPAL INTEGRATION TESTS PASSED! 🎉');
    console.log('======================================================');
  } finally {
    server.close();
  }
}

runE2E().catch(err => {
  console.error('\n❌ E2E Test Failure:', err.message);
  if (server) server.close();
  process.exit(1);
});

