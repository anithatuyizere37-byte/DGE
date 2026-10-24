require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');

// Route modules
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://10.0.2.2:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const health = await db.checkHealth();
  res.json({
    status: 'ok',
    service: 'D&G E-Commerce API',
    shop: 'D&G Rwamagana',
    database: health,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
});

// ─── Database Migration & Server Start ───────────────────────────────────────
async function initSchema() {
  const fs = require('fs');
  const path = require('path');

  const schemaPath = path.join(__dirname, 'migrations', '001_init_schema.sql');
  const seedPath = path.join(__dirname, 'migrations', '002_seed_data.sql');

  try {
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await db.query(schema);
      console.log('✅ Schema migration applied.');
    }

    // Only seed if products table is empty
    const productCount = await db.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count, 10) === 0 && fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      await db.query(seed);
      console.log('✅ Seed data applied.');
    }
  } catch (err) {
    console.error('Migration/seed error:', err.message);
    // Non-fatal: continue starting server
  }
}

async function startServer() {
  try {
    console.log('🔗 Connecting to Neon PostgreSQL...');
    const health = await db.checkHealth();

    if (!health.connected) {
      console.error('❌ Database connection failed:', health.error);
      console.error('   Please check DATABASE_URL in your .env file.');
      process.exit(1);
    }

    console.log(`✅ Connected to database: ${health.database}`);
    await initSchema();

    app.listen(PORT, () => {
      console.log(`🚀 D&G E-Commerce API running on port ${PORT}`);
      console.log(`📦 Shop: D&G Rwamagana Retail`);
      console.log(`🌐 Health: http://localhost:${PORT}/health`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
