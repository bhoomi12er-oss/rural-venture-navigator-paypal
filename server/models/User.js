const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 4,
  },
  role: {
    type: String,
    enum: ['entrepreneur', 'customer'],
    required: [true, 'Please specify user role'],
    default: 'entrepreneur',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
