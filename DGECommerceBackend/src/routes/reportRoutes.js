const express = require('express');
const router = express.Router();
const { getSalesReport, getProductReport, getCustomerReport } = require('../controllers/reportController');
const { authenticateToken, requireOwner } = require('../middleware/auth');

// All report endpoints require Owner authentication
router.use(authenticateToken, requireOwner);

// GET /api/reports/sales
router.get('/sales', getSalesReport);

// GET /api/reports/products
router.get('/products', getProductReport);

// GET /api/reports/customers
router.get('/customers', getCustomerReport);

module.exports = router;
