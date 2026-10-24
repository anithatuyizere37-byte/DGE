const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validateRegistration } = require('../validators/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'dg_ecommerce_secret_rwamagana_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/register
 * Register a new client account. Owner accounts cannot be created here.
 */
async function register(req, res) {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    // Check if email already taken
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email is already registered. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, role)
       VALUES ($1, $2, $3, $4, 'client') RETURNING id, full_name, email, phone_number, role, created_at`,
      [fullName.trim(), email.toLowerCase(), phoneNumber || null, passwordHash]
    );

    const user = result.rows[0];
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await db.query(
      'SELECT id, full_name, email, phone_number, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile
 */
async function getMe(req, res) {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, phone_number, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = result.rows[0];
    return res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Failed to get profile.' });
  }
}

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile
 */
async function updateProfile(req, res) {
  try {
    const { fullName, phoneNumber } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters.' });
    }

    const result = await db.query(
      `UPDATE users SET full_name = $1, phone_number = $2
       WHERE id = $3
       RETURNING id, full_name, email, phone_number, role`,
      [fullName.trim(), phoneNumber || null, req.user.id]
    );

    const user = result.rows[0];
    return res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
    });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
}

module.exports = { register, login, getMe, updateProfile };
