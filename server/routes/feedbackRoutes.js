const express = require('express');
const router = express.Router();
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// POST request can be public (so users scanning packaging QRs don't need to log in to review)
router.post('/', submitFeedback);

// GET feedback restricted to entrepreneurs to read their reviews
router.get('/my', protect, authorize('entrepreneur'), getMyFeedback);

module.exports = router;
