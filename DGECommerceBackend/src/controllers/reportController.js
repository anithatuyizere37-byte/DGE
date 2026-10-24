const db = require('../config/db');

/**
 * GET /api/reports/sales  (Owner only)
 */
async function getSalesReport(req, res) {
  try {
    const { period } = req.query; // 'today' | '7days' | '30days'

    let dateFilter = '';
    if (period === 'today') {
      dateFilter = "AND created_at >= CURRENT_DATE";
    } else if (period === '7days') {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === '30days') {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }

    const [totalsResult, dailyResult, statusResult] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) AS total_orders,
          COALESCE(SUM(total), 0) AS total_sales,
          COALESCE(AVG(total), 0) AS average_order_value
        FROM orders WHERE status != 'cancelled' ${dateFilter}
      `),
      db.query(`
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS orders,
          COALESCE(SUM(total), 0) AS sales
        FROM orders WHERE status != 'cancelled' ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `),
      db.query(`
        SELECT status, COUNT(*) AS count
        FROM orders ${dateFilter ? 'WHERE ' + dateFilter.substring(4) : ''}
        GROUP BY status
      `),
    ]);

    return res.json({
      period: period || 'all',
      totalOrders: parseInt(totalsResult.rows[0].total_orders, 10),
      totalSales: parseInt(totalsResult.rows[0].total_sales, 10),
      averageOrderValue: Math.round(parseFloat(totalsResult.rows[0].average_order_value)),
      dailyBreakdown: dailyResult.rows,
      ordersByStatus: statusResult.rows,
    });
  } catch (err) {
    console.error('GetSalesReport error:', err);
    return res.status(500).json({ message: 'Failed to generate sales report.' });
  }
}

/**
 * GET /api/reports/products  (Owner only)
 */
async function getProductReport(req, res) {
  try {
    const [stockResult, bestSellersResult, outOfStockResult] = await Promise.all([
      db.query(`
        SELECT id, name, category, stock, price,
          CASE WHEN stock = 0 THEN 'out_of_stock'
               WHEN stock <= 5 THEN 'low_stock'
               ELSE 'in_stock' END AS stock_status
        FROM products ORDER BY stock ASC
      `),
      db.query(`
        SELECT p.id, p.name, p.category, p.price,
               COALESCE(SUM(oi.quantity), 0) AS units_sold,
               COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
        GROUP BY p.id, p.name, p.category, p.price
        ORDER BY units_sold DESC
        LIMIT 10
      `),
      db.query('SELECT COUNT(*) AS count FROM products WHERE stock = 0'),
    ]);

    return res.json({
      products: stockResult.rows,
      bestSellers: bestSellersResult.rows,
      outOfStockCount: parseInt(outOfStockResult.rows[0].count, 10),
      lowStockCount: stockResult.rows.filter(p => p.stock_status === 'low_stock').length,
    });
  } catch (err) {
    console.error('GetProductReport error:', err);
    return res.status(500).json({ message: 'Failed to generate product report.' });
  }
}

/**
 * GET /api/reports/customers  (Owner only)
 */
async function getCustomerReport(req, res) {
  try {
    const result = await db.query(`
      SELECT u.id, u.full_name AS "fullName", u.email, u.phone_number AS "phoneNumber",
             u.created_at AS "createdAt",
             COUNT(o.id) AS order_count,
             COALESCE(SUM(o.total), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
      WHERE u.role = 'client'
      GROUP BY u.id, u.full_name, u.email, u.phone_number, u.created_at
      ORDER BY total_spent DESC
    `);

    return res.json({
      customers: result.rows,
      totalCustomers: result.rows.length,
    });
  } catch (err) {
    console.error('GetCustomerReport error:', err);
    return res.status(500).json({ message: 'Failed to generate customer report.' });
  }
}

module.exports = { getSalesReport, getProductReport, getCustomerReport };
