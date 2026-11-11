const mongoose = require('mongoose');

const EntrepreneurProfileSchema = new mongoose.Schema({
  entrepreneurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    default: 'Millet Bakery',
  },
  category: {
    type: String,
    enum: ['cookies', 'snacks', 'flour', 'other'],
    default: 'cookies',
  },
  description: {
    type: String,
    default: '',
  },
  productionCapacity: {
    type: Number,
    default: 200, // units per month
  },
  targetCustomers: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  languagePreference: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EntrepreneurProfile', EntrepreneurProfileSchema);
