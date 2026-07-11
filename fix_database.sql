-- VERITABANI TAMIR SQL
USE ciftcidenkapina;

-- 1. Coupons tablosu - discount_type duzeltme
ALTER TABLE coupons MODIFY COLUMN discount_type VARCHAR(20);
UPDATE coupons SET discount_type = 'PERCENTAGE' WHERE discount_type NOT IN ('PERCENTAGE', 'FIXED');

-- 2. Orders tablosu - payment_method duzeltme  
ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(20);
UPDATE orders SET payment_method = 'TRANSFER' WHERE payment_method NOT IN ('CARD', 'TRANSFER', 'COD');

-- 3. Order status kontrol
ALTER TABLE orders MODIFY COLUMN status VARCHAR(20);

-- 4. Product category kontrol (tekrar)
ALTER TABLE products MODIFY COLUMN category VARCHAR(20);

-- 5. Foreign key sorunu - once users tablosunu kontrol et
SELECT COUNT(*) FROM users;

-- 6. Eger gerekirse foreign key'i gecici disable et
SET FOREIGN_KEY_CHECKS = 0;

-- 7. Bozuk verileri temizle (varsa)
DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM addresses WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM product_images WHERE product_id NOT IN (SELECT id FROM products);
DELETE FROM order_items WHERE order_id NOT IN (SELECT id FROM orders);
DELETE FROM order_items WHERE product_id NOT IN (SELECT id FROM products);

-- 8. Foreign key'i tekrar enable et
SET FOREIGN_KEY_CHECKS = 1;

-- Sonucu kontrol et
SHOW TABLES;
