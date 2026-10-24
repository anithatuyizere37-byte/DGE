const db = require('../config/db');
const { validateProduct } = require('../validators/validators');

/**
 * GET /api/products
 * Returns all products (public)
 */
async function getProducts(req, res) {
  try {
    const { category, search, sort, inStock, limit, offset } = req.query;

    let query = `
      SELECT id, name, description, price, stock, category, image_url AS "imageUrl",
             sku, is_featured AS "isFeatured", is_new_arrival AS "isNewArrival",
             is_best_seller AS "isBestSeller", created_at AS "createdAt"
      FROM products WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (category && category !== 'All') {
      query += ` AND category = $${paramIdx++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (inStock === 'true') {
      query += ` AND stock > 0`;
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY id ASC';
    }

    if (limit && Number.isInteger(Number(limit))) {
      query += ` LIMIT $${paramIdx++}`;
      params.push(Number(limit));
    }

    if (offset && Number.isInteger(Number(offset))) {
      query += ` OFFSET $${paramIdx++}`;
      params.push(Number(offset));
    }

    const result = await db.query(query, params);

    // Set cache headers for public catalog endpoint to prevent network congestion
    res.set({
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
    });

    return res.json(result.rows);
  } catch (err) {
    console.error('GetProducts error:', err);
    return res.status(500).json({ message: 'Failed to fetch products.' });
  }
}

/**
 * GET /api/products/:id
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, name, description, price, stock, category, image_url AS "imageUrl",
              sku, is_featured AS "isFeatured", is_new_arrival AS "isNewArrival",
              is_best_seller AS "isBestSeller", created_at AS "createdAt"
       FROM products WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('GetProductById error:', err);
    return res.status(500).json({ message: 'Failed to fetch product.' });
  }
}

/**
 * POST /api/products  (Owner only)
 */
async function createProduct(req, res) {
  try {
    const { name, description, category, price, stock, imageUrl, sku, isFeatured, isNewArrival, isBestSeller } = req.body;

    const errors = validateProduct(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    const result = await db.query(
      `INSERT INTO products (name, description, price, stock, category, image_url, sku, is_featured, is_new_arrival, is_best_seller)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, description, price, stock, category, image_url AS "imageUrl", sku,
                 is_featured AS "isFeatured", is_new_arrival AS "isNewArrival", is_best_seller AS "isBestSeller"`,
      [
        name.trim(),
        description.trim(),
        Number(price),
        Number(stock),
        category.trim(),
        imageUrl.trim(),
        sku || null,
        !!isFeatured,
        !!isNewArrival,
        !!isBestSeller,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('CreateProduct error:', err);
    return res.status(500).json({ message: 'Failed to create product.' });
  }
}

/**
 * PUT /api/products/:id  (Owner only)
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, imageUrl, sku, isFeatured, isNewArrival, isBestSeller } = req.body;

    const errors = validateProduct(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    const result = await db.query(
      `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category=$5,
       image_url=$6, sku=$7, is_featured=$8, is_new_arrival=$9, is_best_seller=$10
       WHERE id=$11
       RETURNING id, name, description, price, stock, category, image_url AS "imageUrl", sku,
                 is_featured AS "isFeatured", is_new_arrival AS "isNewArrival", is_best_seller AS "isBestSeller"`,
      [
        name.trim(), description.trim(), Number(price), Number(stock),
        category.trim(), imageUrl.trim(), sku || null,
        !!isFeatured, !!isNewArrival, !!isBestSeller, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('UpdateProduct error:', err);
    return res.status(500).json({ message: 'Failed to update product.' });
  }
}

/**
 * DELETE /api/products/:id  (Owner only)
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('DeleteProduct error:', err);
    return res.status(500).json({ message: 'Failed to delete product.' });
  }
}

/**
 * PATCH /api/products/:id/stock  (Owner only)
 */
async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer.' });
    }

    const result = await db.query(
      'UPDATE products SET stock = $1 WHERE id = $2 RETURNING id, name, stock',
      [Number(stock), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('UpdateStock error:', err);
    return res.status(500).json({ message: 'Failed to update stock.' });
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock };
