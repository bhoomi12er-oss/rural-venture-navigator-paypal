const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/entrepreneurController');
const { protect, authorize } = require('../middleware/auth');

// Profile routes restricted to registered entrepreneurs
router.get('/profile', protect, authorize('entrepreneur'), getProfile);
router.post('/profile', protect, authorize('entrepreneur'), updateProfile);

module.exports = router;
