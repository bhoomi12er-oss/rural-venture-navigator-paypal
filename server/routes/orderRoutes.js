const express = require('express');
const router = express.Router();
const {
  getPayPalConfig,
  createPayPalOrder,
  capturePayPalOrder,
  placeOrder,
  getOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Public PayPal configuration (client ID only, no secret)
router.get('/paypal-config', getPayPalConfig);

// Authenticated PayPal order management
router.post('/create-paypal-order', protect, createPayPalOrder);
router.post('/capture-paypal-order', protect, capturePayPalOrder);

// Existing order endpoints (backward-compatible)
router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);

module.exports = router;
