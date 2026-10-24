require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dg_ecommerce_secret_rwamagana_2026';

app.use(cors());
app.use(express.json());

// Neon PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware: Require Owner Role
function requireOwner(req, res, next) {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden: Owner access required' });
  }
  next();
}

/**
 * DATABASE SCHEMA & MIGRATIONS FOR NEON POSTGRESQL
 */
async function initDatabase() {
  console.log('Running Neon PostgreSQL migrations...');

  await pool.query(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone_number VARCHAR(50),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'owner')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Products Table
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      category VARCHAR(100) NOT NULL,
      image_url TEXT NOT NULL,
      sku VARCHAR(50),
      is_featured BOOLEAN DEFAULT FALSE,
      is_new_arrival BOOLEAN DEFAULT FALSE,
      is_best_seller BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name VARCHAR(150) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      delivery_address TEXT NOT NULL,
      district VARCHAR(100) NOT NULL DEFAULT 'Rwamagana',
      payment_method VARCHAR(50) NOT NULL,
      payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      status VARCHAR(50) NOT NULL DEFAULT 'placed',
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      name VARCHAR(200) NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );
  `);

  // Seed Default Categories
  const catCount = await pool.query('SELECT COUNT(*) as count FROM categories;');
  if (parseInt(catCount.rows[0].count, 10) === 0) {
    const cats = [
      ['Clothes', 'Fashion and casual apparel'],
      ['Shoes', 'Footwear for all occasions'],
      ['Bags', 'Handbags, backpacks, and luggage'],
      ['Household Equipment', 'Home and kitchen essentials'],
      ['Jewellery', 'Rings, necklaces, and accessories'],
      ['Cosmetics', 'Beauty and personal care products'],
    ];
    for (const [name, desc] of cats) {
      await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING;',
        [name, desc]
      );
    }
    console.log('Seeded default product categories');
  }

  // Seed Default Owner and Client Accounts
  const userCount = await pool.query('SELECT COUNT(*) as count FROM users;');
  if (parseInt(userCount.rows[0].count, 10) === 0) {
    const ownerHash = await bcrypt.hash('Owner1234!', 10);
    const clientHash = await bcrypt.hash('Client1234!', 10);

    await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, role)
       VALUES 
       ('D&G Shop Owner', 'owner@dgecommerce.rw', '+250 788 000 001', $1, 'owner'),
       ('Jean Claude Uwase', 'client@rwamagana.rw', '+250 788 123 456', $2, 'client');`,
      [ownerHash, clientHash]
    );
    console.log('Seeded default Owner and Client accounts');
  }

  // Seed Initial Products
  const prodCount = await pool.query('SELECT COUNT(*) as count FROM products;');
  if (parseInt(prodCount.rows[0].count, 10) === 0) {
    const seedProds = [
      [
        'Smart Men Casual Shirt',
        'High-quality cotton casual buttoned shirt. Breathable and durable for work or casual events.',
        18000,
        25,
        'Clothes',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
        'DG-CLO-001',
        true,
        true,
        true,
      ],
      [
        'Elegant Women Summer Dress',
        'Vibrant patterned comfortable dress made from premium breathable fabrics.',
        24000,
        14,
        'Clothes',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80',
        'DG-CLO-002',
        true,
        false,
        true,
      ],
      [
        'Classic Leather Oxford Shoes',
        'Genuine leather executive shoes with padded inner soles for supreme comfort.',
        45000,
        8,
        'Shoes',
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80',
        'DG-SHO-001',
        true,
        true,
        true,
      ],
      [
        'Comfortable Daily Sneakers',
        'Lightweight cushioned unisex sports and leisure sneakers.',
        28000,
        2,
        'Shoes',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        'DG-SHO-002',
        false,
        true,
        false,
      ],
      [
        'Leather Business Laptop Backpack',
        'Water-resistant compartments for laptops up to 15.6 inches with multiple secure pockets.',
        32000,
        12,
        'Bags',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
        'DG-BAG-001',
        true,
        false,
        true,
      ],
      [
        'Stainless Steel Electric Kettle 2.0L',
        'Fast-boiling automatic shut-off kettle with boil-dry safety protection.',
        19500,
        18,
        'Household Equipment',
        'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&q=80',
        'DG-HOU-001',
        false,
        true,
        false,
      ],
      [
        'Gold Plated Luxury Pendant Necklace',
        'Tarnish-resistant fine jewelry piece designed for banquets and celebrations.',
        15000,
        0,
        'Jewellery',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
        'DG-JEW-001',
        true,
        false,
        false,
      ],
      [
        'Organic Shea Butter Moisturizer',
        'Natural soothing skin hydration cream suitable for all tropical skin types.',
        8500,
        30,
        'Cosmetics',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
        'DG-COS-001',
        false,
        true,
        true,
      ],
    ];

    for (const p of seedProds) {
      await pool.query(
        `INSERT INTO products (name, description, price, stock, category, image_url, sku, is_featured, is_new_arrival, is_best_seller)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        p
      );
    }
    console.log('Seeded initial products catalog');
  }

  console.log('Neon PostgreSQL initialization complete!');
}

/**
 * API ROUTES
 */

// Root Health & System Status
app.get('/', (req, res) => {
  res.json({
    app: 'D&G E-Commerce API',
    location: 'Rwamagana, Rwanda',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query(
      'SELECT NOW() as current_time, current_database() as database, version() as version;'
    );
    res.json({
      status: 'healthy',
      services: {
        api: 'running',
        neon_postgres: {
          connected: true,
          database: dbRes.rows[0].database,
          timestamp: dbRes.rows[0].current_time,
          version: dbRes.rows[0].version,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'degraded', error: err.message });
  }
});

// Authentication: Register (Clients only)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required registration fields' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1;', [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Explicitly enforce role='client' for public registrations
    const insertRes = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, role)
       VALUES ($1, $2, $3, $4, 'client')
       RETURNING id, full_name, email, phone_number, role;`,
      [fullName, email.toLowerCase(), phoneNumber || null, passwordHash]
    );

    const user = {
      id: insertRes.rows[0].id,
      fullName: insertRes.rows[0].full_name,
      email: insertRes.rows[0].email,
      phoneNumber: insertRes.rows[0].phone_number,
      role: insertRes.rows[0].role,
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ message: 'Registration successful', token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Authentication: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const userRes = await pool.query(
      'SELECT id, full_name, email, phone_number, password_hash, role FROM users WHERE email = $1;',
      [email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const dbUser = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = {
      id: dbUser.id,
      fullName: dbUser.full_name,
      email: dbUser.email,
      phoneNumber: dbUser.phone_number,
      role: dbUser.role,
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC;');
    res.json(categories.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Products API: Get Products (with Search, Filter, Sort)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, inStock, sort } = req.query;

    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    if (inStock === 'true') {
      queryText += ' AND stock > 0';
    }

    if (sort === 'price_asc') {
      queryText += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      queryText += ' ORDER BY price DESC';
    } else {
      queryText += ' ORDER BY id DESC';
    }

    const result = await pool.query(queryText, params);
    res.json(
      result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        category: row.category,
        imageUrl: row.image_url,
        sku: row.sku,
        isFeatured: row.is_featured,
        isNewArrival: row.is_new_arrival,
        isBestSeller: row.is_best_seller,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Products API: Create (Owner only)
app.post('/api/products', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl, sku } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category, image_url, sku, is_new_arrival)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *;`,
      [name, description, price, stock, category, imageUrl, sku]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      category: row.category,
      imageUrl: row.image_url,
      sku: row.sku,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Products API: Update (Owner only)
app.put('/api/products/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, imageUrl, sku } = req.body;
    await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           category = COALESCE($5, category),
           image_url = COALESCE($6, image_url),
           sku = COALESCE($7, sku)
       WHERE id = $8;`,
      [name, description, price, stock, category, imageUrl, sku, id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Products API: Delete (Owner only)
app.delete('/api/products/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1;', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Orders API: List Orders
app.get('/api/orders', async (req, res) => {
  try {
    const ordersResult = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
    const orders = [];

    for (const ord of ordersResult.rows) {
      const itemsResult = await pool.query(
        'SELECT product_id, name, price, quantity FROM order_items WHERE order_id = $1;',
        [ord.id]
      );
      orders.push({
        id: ord.id,
        createdAt: ord.created_at,
        customerName: ord.customer_name,
        customerPhone: ord.customer_phone,
        deliveryAddress: ord.delivery_address,
        district: ord.district,
        paymentMethod: ord.payment_method,
        paymentStatus: ord.payment_status,
        status: ord.status,
        subtotal: ord.subtotal,
        deliveryFee: ord.delivery_fee,
        total: ord.total,
        items: itemsResult.rows.map((i) => ({
          productId: i.product_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Orders API: Create Order
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      id,
      customerName,
      customerPhone,
      deliveryAddress,
      district,
      paymentMethod,
      items,
      subtotal,
      deliveryFee,
      total,
    } = req.body;

    const orderId =
      id ||
      `DG-ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;

    await client.query(
      `INSERT INTO orders (id, customer_name, customer_phone, delivery_address, district, payment_method, payment_status, status, subtotal, delivery_fee, total)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending', 'placed', $7, $8, $9);`,
      [
        orderId,
        customerName,
        customerPhone,
        deliveryAddress,
        district || 'Rwamagana',
        paymentMethod,
        subtotal,
        deliveryFee || 0,
        total,
      ]
    );

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, name, price, quantity)
           VALUES ($1, $2, $3, $4, $5);`,
          [orderId, item.productId || null, item.name, item.price, item.quantity]
        );
        // Deduct stock safely
        if (item.productId) {
          await client.query(
            'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2;',
            [item.quantity, item.productId]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation transaction failed:', err);
    res.status(500).json({ message: 'Order creation transaction failed' });
  } finally {
    client.release();
  }
});

// Orders API: Update Status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const paymentStatus = status === 'delivered' ? 'Paid' : 'Pending';

    await pool.query(
      'UPDATE orders SET status = $1, payment_status = $2 WHERE id = $3;',
      [status, paymentStatus, id]
    );

    res.json({ message: 'Order status updated', status, paymentStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`D&G E-Commerce server running on port ${PORT}`);
  try {
    await initDatabase();
  } catch (e) {
    console.error('Database migration/seed warning:', e);
  }
});

module.exports = { app, server, pool };
