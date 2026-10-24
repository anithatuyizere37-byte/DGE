const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');

// GET /api/categories  (public)
router.get('/', getCategories);

module.exports = router;
