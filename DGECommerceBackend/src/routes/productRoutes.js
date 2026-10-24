const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById,
  createProduct, updateProduct, deleteProduct, updateStock
} = require('../controllers/productController');
const { authenticateToken, requireOwner } = require('../middleware/auth');

// GET /api/products  (public)
router.get('/', getProducts);

// GET /api/products/:id  (public)
router.get('/:id', getProductById);

// POST /api/products  (Owner only)
router.post('/', authenticateToken, requireOwner, createProduct);

// PUT /api/products/:id  (Owner only)
router.put('/:id', authenticateToken, requireOwner, updateProduct);

// DELETE /api/products/:id  (Owner only)
router.delete('/:id', authenticateToken, requireOwner, deleteProduct);

// PATCH /api/products/:id/stock  (Owner only)
router.patch('/:id/stock', authenticateToken, requireOwner, updateStock);

module.exports = router;
