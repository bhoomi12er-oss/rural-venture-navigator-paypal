const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const generateToken = (id, role, name) => {
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET || 'supersecretjwtsecretkey123!@#', {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  const { name, phone, password, role, email } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, phone, and password' });
  }

  try {
    let userExists;
    if (global.dbConnected) {
      userExists = await User.findOne({ phone });
    } else {
      userExists = mockStore.findOne('users', { phone });
    }

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (global.dbConnected) {
      newUser = await User.create({
        name,
        phone,
        email: email || '',
        password: hashedPassword,
        role: role || 'entrepreneur',
      });
    } else {
      newUser = mockStore.create('users', {
        name,
        phone,
        email: email || '',
        password: hashedPassword,
        role: role || 'entrepreneur',
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(newUser._id, newUser.role, newUser.name),
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Please provide phone and password' });
  }

  try {
    let user;
    if (global.dbConnected) {
      user = await User.findOne({ phone });
    } else {
      user = mockStore.findOne('users', { phone });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials / credentials galat hain' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials / credentials galat hain' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id, user.role, user.name),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
};

module.exports = { register, login, getMe };
