const express = require('express');
const router = express.Router();
const {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/my', protect, authorize('entrepreneur'), getMyProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('entrepreneur'), createProduct);
router.put('/:id', protect, authorize('entrepreneur'), updateProduct);
router.delete('/:id', protect, authorize('entrepreneur'), deleteProduct);

module.exports = router;
