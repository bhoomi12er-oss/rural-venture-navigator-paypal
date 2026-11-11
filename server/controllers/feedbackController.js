const Feedback = require('../models/Feedback');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');
const jwt = require('jsonwebtoken');

const submitFeedback = async (req, res) => {
  const { productId, rating, wouldBuyAgain, priceReasonable, comment } = req.body;

  if (!productId || !rating || wouldBuyAgain === undefined || !priceReasonable) {
    return res.status(400).json({ success: false, message: 'Please provide all feedback fields' });
  }

  try {
    let product;
    if (global.dbConnected) {
      product = await Product.findById(productId);
    } else {
      // In mock mode, check ID or fallback to the first product if it doesn't match
      product = mockStore.findById('products', productId);
      if (!product) {
        const allProds = mockStore.find('products', {});
        if (allProds.length > 0) {
          product = allProds[0];
        }
      }
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Capture customer ID if they are logged in while reviewing
    let customerId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtsecretkey123!@#');
        customerId = decoded.id;
      } catch (err) {
        // Continue saving anonymously if token is invalid
      }
    }

    const feedbackData = {
      productId: product._id,
      entrepreneurId: product.entrepreneurId || 'mock_owner_1',
      customerId,
      rating: Number(rating),
      wouldBuyAgain: wouldBuyAgain === true || wouldBuyAgain === 'true',
      priceReasonable,
      comment: comment || '',
    };

    let feedback;
    if (global.dbConnected) {
      feedback = await Feedback.create(feedbackData);
    } else {
      feedback = mockStore.create('feedbacks', feedbackData);
    }

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    let feedbacks;
    if (global.dbConnected) {
      feedbacks = await Feedback.find({ entrepreneurId: req.user._id })
        .populate('productId', 'productName')
        .sort({ createdAt: -1 });
    } else {
      feedbacks = mockStore.find('feedbacks', { entrepreneurId: req.user._id });
      feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const products = mockStore.find('products', {});
      feedbacks = feedbacks.map(fb => {
        const prod = products.find(p => String(p._id) === String(fb.productId));
        return {
          ...fb,
          productId: prod ? { _id: prod._id, productName: prod.productName } : { productName: 'Product' }
        };
      });
      
      // Inject some initial seed review logs if feedback is empty
      if (feedbacks.length === 0) {
        const mockReviews = [
          {
            _id: "seed_fb_1",
            productId: { productName: "Ragi Chocolate Almond Cookies" },
            rating: 5,
            wouldBuyAgain: true,
            priceReasonable: "reasonable",
            comment: "Cookies swad mein bohot swadist hain, ragi and badam ka combination badhiya hai.",
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: "seed_fb_2",
            productId: { productName: "Ragi Chocolate Almond Cookies" },
            rating: 4,
            wouldBuyAgain: true,
            priceReasonable: "reasonable",
            comment: "Packing acchi hai, bacchon ko bohot pasand aaya biscuit.",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: "seed_fb_3",
            productId: { productName: "Ragi Chocolate Almond Cookies" },
            rating: 5,
            wouldBuyAgain: true,
            priceReasonable: "cheap",
            comment: "₹35 mein ragi almond biscuit bohot badhiya aur sasta hai.",
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        feedbacks = mockReviews;
      }
    }

    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitFeedback, getMyFeedback };
