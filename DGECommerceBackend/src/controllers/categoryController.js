const db = require('../config/db');

/**
 * GET /api/categories
 */
async function getCategories(req, res) {
  try {
    const result = await db.query(
      'SELECT id, name, description FROM categories ORDER BY name ASC'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('GetCategories error:', err);
    return res.status(500).json({ message: 'Failed to fetch categories.' });
  }
}

module.exports = { getCategories };
