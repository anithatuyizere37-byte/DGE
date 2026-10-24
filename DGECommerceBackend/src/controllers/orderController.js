const db = require('../config/db');
const { validateOrder } = require('../validators/validators');

/**
 * Generate D&G order number
 */
function generateOrderId(count) {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DG-ORD-${year}-${String(count + 1).padStart(3, '0')}-${rand}`;
}

/**
 * POST /api/orders  (Authenticated clients)
 * Create a new order — wrapped in a transaction for data consistency
 */
async function createOrder(req, res) {
  const client = await db.getClient();
  try {
    const {
      customerName, customerPhone, deliveryAddress, district,
      paymentMethod, items, subtotal, deliveryFee, total
    } = req.body;

    const errors = validateOrder(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    await client.query('BEGIN');

    // Count existing orders to generate unique ID
    const countResult = await client.query('SELECT COUNT(*) FROM orders');
    const orderCount = parseInt(countResult.rows[0].count, 10);
    const orderId = generateOrderId(orderCount);

    // Insert order
    await client.query(
      `INSERT INTO orders (id, user_id, customer_name, customer_phone, delivery_address, district,
        payment_method, payment_status, status, subtotal, delivery_fee, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Pending','placed',$8,$9,$10)`,
      [
        orderId,
        req.user.id,
        customerName.trim(),
        customerPhone.trim(),
        deliveryAddress.trim(),
        district || 'Rwamagana',
        paymentMethod,
        Number(subtotal),
        Number(deliveryFee || 0),
        Number(total),
      ]
    );

    // Insert order items & reduce stock with authoritative server-side stock verification
    for (const item of items) {
      const prodId = item.productId || item.id;
      // Authoritatively verify live stock in database
      const stockCheck = await client.query('SELECT stock, price, name FROM products WHERE id = $1 FOR UPDATE', [prodId]);
      if (stockCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Product ${item.name} is no longer available in catalog.` });
      }

      const availableStock = stockCheck.rows[0].stock;
      if (availableStock < Number(item.quantity)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Insufficient stock for ${stockCheck.rows[0].name}. Only ${availableStock} units remaining in Rwamagana store.`,
        });
      }

      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, prodId, item.name, Number(item.price), Number(item.quantity)]
      );

      // Decrement product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [Number(item.quantity), prodId]
      );
    }

    // Insert payment record
    await client.query(
      `INSERT INTO payments (order_id, amount, method, status)
       VALUES ($1, $2, $3, 'Pending')`,
      [orderId, Number(total), paymentMethod]
    );

    await client.query('COMMIT');

    // Fetch the complete order to return using the active client
    const orderResult = await client.query(
      `SELECT id, user_id AS "userId", customer_name AS "customerName",
              customer_phone AS "customerPhone", delivery_address AS "deliveryAddress",
              district, payment_method AS "paymentMethod", payment_status AS "paymentStatus",
              status, subtotal, delivery_fee AS "deliveryFee", total, created_at AS "createdAt"
       FROM orders WHERE id = $1`,
      [orderId]
    );

    const itemsResult = await client.query(
      `SELECT product_id AS "productId", name, price, quantity FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    return res.status(201).json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}
    console.error('CreateOrder error:', err);
    return res.status(500).json({ message: 'Failed to create order. Please try again.' });
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders  (Owner: all orders; Client: own orders)
 */
async function getOrders(req, res) {
  try {
    const { status } = req.query;
    const isOwner = req.user.role === 'owner';

    let query = `
      SELECT o.id, o.user_id AS "userId", o.customer_name AS "customerName",
             o.customer_phone AS "customerPhone", o.delivery_address AS "deliveryAddress",
             o.district, o.payment_method AS "paymentMethod", o.payment_status AS "paymentStatus",
             o.status, o.subtotal, o.delivery_fee AS "deliveryFee", o.total, o.created_at AS "createdAt"
      FROM orders o WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (!isOwner) {
      query += ` AND o.user_id = $${paramIdx++}`;
      params.push(req.user.id);
    }

    if (status) {
      query += ` AND o.status = $${paramIdx++}`;
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const ordersResult = await db.query(query, params);
    const orders = ordersResult.rows;

    // Attach items to each order
    for (const order of orders) {
      const itemsResult = await db.query(
        `SELECT product_id AS "productId", name, price, quantity FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return res.json(orders);
  } catch (err) {
    console.error('GetOrders error:', err);
    return res.status(500).json({ message: 'Failed to fetch orders.' });
  }
}

/**
 * GET /api/orders/:id
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const isOwner = Boolean(req.user && req.user.role === 'owner');

    const result = await db.query(
      `SELECT o.id, o.user_id AS "userId", o.customer_name AS "customerName",
              o.customer_phone AS "customerPhone", o.delivery_address AS "deliveryAddress",
              o.district, o.payment_method AS "paymentMethod", o.payment_status AS "paymentStatus",
              o.status, o.subtotal, o.delivery_fee AS "deliveryFee", o.total, o.created_at AS "createdAt"
       FROM orders o WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = result.rows[0];

    // Authenticated non-owner clients can only view their own orders
    if (req.user && !isOwner && order.userId && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const itemsResult = await db.query(
      `SELECT product_id AS "productId", name, price, quantity FROM order_items WHERE order_id = $1`,
      [id]
    );
    order.items = itemsResult.rows;

    return res.json(order);
  } catch (err) {
    console.error('GetOrderById error:', err);
    return res.status(500).json({ message: 'Failed to fetch order.' });
  }
}

/**
 * PUT /api/orders/:id/status  (Owner only)
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}.` });
    }

    // Update payment status to Paid when delivered
    let paymentStatus;
    if (status === 'delivered') {
      paymentStatus = 'Paid';
    }

    const result = await db.query(
      `UPDATE orders SET status = $1${paymentStatus ? ', payment_status = $3' : ''}
       WHERE id = $2 RETURNING id, status, payment_status AS "paymentStatus"`,
      paymentStatus ? [status, id, paymentStatus] : [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('UpdateOrderStatus error:', err);
    return res.status(500).json({ message: 'Failed to update order status.' });
  }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
