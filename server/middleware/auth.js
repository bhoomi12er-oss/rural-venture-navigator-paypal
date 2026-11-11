const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtsecretkey123!@#');

    // Safe DB check
    if (!global.dbConnected) {
      // JSON file fallback mode
      const mockUsersFile = path.join(__dirname, '../data/users.json');
      let user = null;
      
      if (fs.existsSync(mockUsersFile)) {
        try {
          const users = JSON.parse(fs.readFileSync(mockUsersFile, 'utf8'));
          user = users.find(u => u._id === decoded.id);
        } catch (e) {}
      }
      
      if (!user) {
        user = { _id: decoded.id, role: decoded.role, name: decoded.name || 'Test User' };
      }
      
      req.user = user;
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
