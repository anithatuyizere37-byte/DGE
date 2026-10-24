const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', authenticateToken, getMe);

// PUT /api/auth/profile  (protected)
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;
