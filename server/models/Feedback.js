const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // optional if submitted anonymously by scanning packaging QR
  },
  rating: {
    type: Number,
    required: [true, 'Please rate the product between 1 and 5'],
    min: 1,
    max: 5,
  },
  wouldBuyAgain: {
    type: Boolean,
    required: true,
  },
  priceReasonable: {
    type: String, // 'reasonable' | 'expensive' | 'cheap' to match the frontend
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
