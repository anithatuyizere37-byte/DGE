/**
 * Validation helpers for request body fields
 */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\+?[0-9\s\-]{7,15}$/.test(phone);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function validatePrice(price) {
  return Number.isInteger(Number(price)) && Number(price) >= 0;
}

function validateStock(stock) {
  return Number.isInteger(Number(stock)) && Number(stock) >= 0;
}

/**
 * Validate registration fields
 */
function validateRegistration(body) {
  const errors = [];
  if (!body.fullName || body.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }
  if (!body.email || !validateEmail(body.email)) {
    errors.push('A valid email address is required.');
  }
  if (!body.password || !validatePassword(body.password)) {
    errors.push('Password must be at least 6 characters.');
  }
  if (body.phoneNumber && !validatePhone(body.phoneNumber)) {
    errors.push('Phone number format is invalid.');
  }
  return errors;
}

/**
 * Validate product fields
 */
function validateProduct(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) {
    errors.push('Product name is required (min 2 characters).');
  }
  if (!body.description || body.description.trim().length < 5) {
    errors.push('Product description is required (min 5 characters).');
  }
  if (!body.category || body.category.trim().length < 2) {
    errors.push('Product category is required.');
  }
  if (body.price === undefined || body.price === null || !validatePrice(body.price)) {
    errors.push('Price must be a non-negative integer (RWF).');
  }
  if (body.stock === undefined || body.stock === null || !validateStock(body.stock)) {
    errors.push('Stock must be a non-negative integer.');
  }
  const finalImage = body.imageUrl || (Array.isArray(body.images) && body.images[0]) || '';
  if (!finalImage || typeof finalImage !== 'string' || finalImage.trim().length < 5) {
    errors.push('Product image URL is required.');
  }
  return errors;
}

/**
 * Validate checkout order fields
 */
function validateOrder(body) {
  const errors = [];
  if (!body.customerName || body.customerName.trim().length < 2) {
    errors.push('Customer name is required.');
  }
  if (!body.customerPhone || !validatePhone(body.customerPhone)) {
    errors.push('A valid customer phone number is required.');
  }
  if (!body.deliveryAddress || body.deliveryAddress.trim().length < 5) {
    errors.push('Delivery address is required.');
  }
  const pm = body.paymentMethod || '';
  if (!pm || (!['Cash on Delivery', 'Mobile Money'].includes(pm) && !pm.startsWith('Mobile Money'))) {
    errors.push('Payment method must be "Cash on Delivery" or "Mobile Money".');
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push('Order must include at least one item.');
  }
  return errors;
}

module.exports = { validateRegistration, validateProduct, validateOrder };
