-- Migration 002: Seed Initial Data for D&G Rwamagana

-- Seed Categories
INSERT INTO categories (name, description) VALUES
  ('Clothes', 'Fashion and casual apparel for men and women'),
  ('Shoes', 'Footwear for all occasions and work'),
  ('Bags', 'Handbags, backpacks, and executive luggage'),
  ('Household Equipment', 'Home and kitchen appliances'),
  ('Jewellery', 'Rings, necklaces, and accessories'),
  ('Cosmetics', 'Beauty and personal care products')
ON CONFLICT (name) DO NOTHING;

-- Seed Default Accounts
-- Passwords hashed with bcrypt:
-- Owner1234! -> $2a$10$o8.jQ8a6yvP1QZ1W...
-- Client1234! -> $2a$10$V01mK5L...
INSERT INTO users (full_name, email, phone_number, password_hash, role)
VALUES 
  ('D&G Shop Owner', 'owner@dgecommerce.rw', '+250 788 000 001', '$2b$12$xVGImGDo6eSRMuSgPlalheVeYfegCpgiscKYitT/xlJrNV2Wlj.nK', 'owner'),
  ('Jean Claude Uwase', 'client@rwamagana.rw', '+250 788 123 456', '$2b$12$JPM6IvbT7Gic1MeHfmZlcOx/obWpnAAhT2VcQkSjSaZ0ut1yiJlBC', 'client')
ON CONFLICT (email) DO NOTHING;

-- Seed Initial Products
INSERT INTO products (name, description, price, stock, category, image_url, sku, is_featured, is_new_arrival, is_best_seller)
VALUES
  ('Smart Men Casual Shirt', 'High-quality cotton casual buttoned shirt. Breathable and durable.', 18000, 25, 'Clothes', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80', 'DG-CLO-001', true, true, true),
  ('Elegant Women Summer Dress', 'Vibrant patterned comfortable dress made from premium breathable fabrics.', 24000, 14, 'Clothes', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80', 'DG-CLO-002', true, false, true),
  ('Classic Leather Oxford Shoes', 'Genuine leather executive shoes with padded inner soles.', 45000, 8, 'Shoes', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80', 'DG-SHO-001', true, true, true),
  ('Comfortable Daily Sneakers', 'Lightweight cushioned unisex sports and leisure sneakers.', 28000, 2, 'Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', 'DG-SHO-002', false, true, false),
  ('Leather Business Laptop Backpack', 'Water-resistant compartments for laptops up to 15.6 inches.', 32000, 12, 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', 'DG-BAG-001', true, false, true),
  ('Stainless Steel Electric Kettle 2.0L', 'Fast-boiling automatic shut-off kettle with boil-dry safety protection.', 19500, 18, 'Household Equipment', 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&q=80', 'DG-HOU-001', false, true, false),
  ('Gold Plated Luxury Pendant Necklace', 'Tarnish-resistant fine jewelry piece designed for banquets and celebrations.', 15000, 0, 'Jewellery', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80', 'DG-JEW-001', true, false, false),
  ('Organic Shea Butter Moisturizer', 'Natural soothing skin hydration cream suitable for all tropical skin types.', 8500, 30, 'Cosmetics', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80', 'DG-COS-001', false, true, true)
ON CONFLICT DO NOTHING;
