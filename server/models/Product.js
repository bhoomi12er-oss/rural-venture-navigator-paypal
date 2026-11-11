const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please add product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add product description'],
  },
  category: {
    type: String,
    required: [true, 'Please add product category'],
    enum: ['cookies', 'snacks', 'flour', 'other'],
  },
  price: {
    type: Number,
    required: [true, 'Please add product price'],
  },
  ingredients: {
    type: String,
    required: [true, 'Please specify ingredients'],
  },
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availableQuantity: {
    type: Number,
    default: 100,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
