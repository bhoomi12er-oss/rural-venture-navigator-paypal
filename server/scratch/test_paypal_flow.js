/**
 * Automated test script for PayPal Sandbox endpoints & price calculations
 */
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mockStore = require('../utils/mockStore');
const paypalUtil = require('../utils/paypal');
const orderController = require('../controllers/orderController');

async function runTests() {
  console.log('--- Starting PayPal Sandbox Integration Tests ---');

  // Test 1: Configuration check
  console.log('Test 1: Verify PayPal config exposure');
  const mockReqConfig = {};
  let configResponse = null;
  const mockResConfig = {
    status: (code) => ({
      json: (data) => {
        configResponse = { code, data };
        return data;
      }
    })
  };
  await orderController.getPayPalConfig(mockReqConfig, mockResConfig);
  assert.strictEqual(configResponse.code, 200);
  assert.ok(configResponse.data.success);
  assert.ok('clientId' in configResponse.data);
  assert.ok(!('clientSecret' in configResponse.data), 'CRITICAL: clientSecret must never be exposed');
  console.log('✓ Test 1 passed: Client ID exposed, secret strictly protected');

  // Seed mock product
  const testProduct = mockStore.create('products', {
    productName: 'Organic Ragi Cookies Test',
    price: 40, // 40 INR
    category: 'cookies',
    ingredients: 'Ragi, Jaggery',
    entrepreneurId: 'mock_seller_99',
    availableQuantity: 50,
  });

  const mockUser = {
    _id: 'mock_customer_77',
    name: 'Priya Sharma',
    role: 'customer'
  };

  // Test 2: Price Calculation on Server (Never trust client prices)
  console.log('Test 2: Price Calculation on Server (Never trust client prices)');
  let createResponse = null;
  const mockReqCreate = {
    user: mockUser,
    body: {
      items: [
        {
          productId: testProduct._id,
          quantity: 2,
          // Intentionally attempt client-side price tampering
          price: 5,
          totalAmount: 10
        }
      ]
    }
  };
  const mockResCreate = {
    status: (code) => ({
      json: (data) => {
        createResponse = { code, data };
        return data;
      }
    })
  };

  await orderController.createPayPalOrder(mockReqCreate, mockResCreate);
  assert.strictEqual(createResponse.code, 201);
  assert.ok(createResponse.data.success);
  assert.ok(createResponse.data.orderID);

  // Expected: 40 INR * 2 = 80 INR
  assert.strictEqual(createResponse.data.totalAmountINR, 80, 'Tampered price was ignored; server computed 80 INR');
  // At rate 0.012: 40 * 0.012 = 0.48 USD per unit * 2 = 0.96 USD
  const expectedUSD = 0.96;
  assert.strictEqual(createResponse.data.totalAmountCurrency, expectedUSD);
  console.log('✓ Test 2 passed: Client price tampering prevented, trusted price calculated correctly (INR 80 / $0.96 USD)');

  // Test 3: Order Capture & Persistence
  console.log('Test 3: Order Capture & System Recording');
  let captureResponse = null;
  const mockReqCapture = {
    user: mockUser,
    body: {
      orderID: createResponse.data.orderID,
      items: [
        { productId: testProduct._id, quantity: 2 }
      ]
    }
  };
  const mockResCapture = {
    status: (code) => ({
      json: (data) => {
        captureResponse = { code, data };
        return data;
      }
    })
  };

  await orderController.capturePayPalOrder(mockReqCapture, mockResCapture);
  assert.strictEqual(captureResponse.code, 200);
  assert.ok(captureResponse.data.success);
  assert.ok(captureResponse.data.captureId);
  assert.strictEqual(captureResponse.data.orders.length, 1);

  const recordedOrder = captureResponse.data.orders[0];
  assert.strictEqual(recordedOrder.paymentStatus, 'paid');
  assert.strictEqual(recordedOrder.paymentMethod, 'paypal');
  assert.strictEqual(recordedOrder.paypalOrderId, createResponse.data.orderID);
  assert.ok(recordedOrder.paypalCaptureId);
  assert.strictEqual(recordedOrder.price, 40);
  assert.strictEqual(recordedOrder.totalAmount, 80);
  console.log('✓ Test 3 passed: Payment captured and order recorded with paypalOrderId & paypalCaptureId');

  // Test 4: Verify getOrders returns PayPal transaction details
  console.log('Test 4: Verify getOrders populates PayPal order details');
  let listResponse = null;
  const mockReqList = {
    user: mockUser
  };
  const mockResList = {
    status: (code) => ({
      json: (data) => {
        listResponse = { code, data };
        return data;
      }
    })
  };

  await orderController.getOrders(mockReqList, mockResList);
  assert.strictEqual(listResponse.code, 200);
  assert.ok(listResponse.data.success);
  const found = listResponse.data.orders.find(o => o.paypalOrderId === createResponse.data.orderID);
  assert.ok(found, 'Order found in user order history');
  assert.strictEqual(found.paymentStatus, 'paid');
  assert.strictEqual(found.paymentMethod, 'paypal');
  console.log('✓ Test 4 passed: Customer order history accurately reflects PayPal status');

  console.log('\n--- All Backend PayPal Integration Tests Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});

