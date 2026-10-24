const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, requireOwner, optionalAuth } = require('../middleware/auth');

// POST /api/orders  (Authenticated clients)
router.post('/', authenticateToken, createOrder);

// GET /api/orders  (Owner: all; Client: own)
router.get('/', authenticateToken, getOrders);

// GET /api/orders/:id  (Optional auth: owner sees everything, client sees own, guest can track by order ID)
router.get('/:id', optionalAuth, getOrderById);

// PUT /api/orders/:id/status  (Owner only)
router.put('/:id/status', authenticateToken, requireOwner, updateOrderStatus);

module.exports = router;
