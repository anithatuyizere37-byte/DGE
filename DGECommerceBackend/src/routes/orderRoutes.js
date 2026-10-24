const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, requireOwner } = require('../middleware/auth');

// POST /api/orders  (Authenticated clients)
router.post('/', authenticateToken, createOrder);

// GET /api/orders  (Owner: all; Client: own)
router.get('/', authenticateToken, getOrders);

// GET /api/orders/:id
router.get('/:id', authenticateToken, getOrderById);

// PUT /api/orders/:id/status  (Owner only)
router.put('/:id/status', authenticateToken, requireOwner, updateOrderStatus);

module.exports = router;
