const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed', // completed by default for mock purchase flow
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'paid',
  },
  paymentMethod: {
    type: String,
    default: 'mock', // 'paypal' or 'mock'
  },
  paypalOrderId: {
    type: String,
    default: null,
  },
  paypalCaptureId: {
    type: String,
    default: null,
  },
  paypalPayerEmail: {
    type: String,
    default: null,
  },
  paypalDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);
