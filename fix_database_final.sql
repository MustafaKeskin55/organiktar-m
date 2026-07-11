-- ============================================
-- VERITABANI TEMIZLEME VE DUZELTME SCRIPT
-- ============================================
-- HeidiSQL'de calistirin!

SET FOREIGN_KEY_CHECKS = 0;

-- 1. discount_type sütununu VARCHAR yap (esnek)
ALTER TABLE coupons 
MODIFY COLUMN discount_type VARCHAR(20);

-- 2. payment_method sütununu VARCHAR yap (esnek)  
ALTER TABLE orders 
MODIFY COLUMN payment_method VARCHAR(20);

-- 3. Hatali discount_type degerlerini duzelt
UPDATE coupons 
SET discount_type = 'PERCENTAGE' 
WHERE discount_type NOT IN ('PERCENTAGE', 'FIXED') 
   OR discount_type IS NULL;

-- 4. Hatali payment_method degerlerini duzelt
UPDATE orders 
SET payment_method = 'CASH' 
WHERE payment_method NOT IN ('CASH', 'CARD', 'TRANSFER', 'ONLINE') 
   OR payment_method IS NULL;

-- 5. orders tablosundaki gecersiz user_id'leri temizle (gecersiz FK)
DELETE FROM orders 
WHERE user_id NOT IN (SELECT id FROM users);

-- 6. order_items tablosundaki gecersiz order_id'leri temizle
DELETE FROM order_items 
WHERE order_id NOT IN (SELECT id FROM orders);

-- 7. product_id gecersiz olan kayitlari temizle
DELETE FROM order_items 
WHERE product_id NOT IN (SELECT id FROM products);

-- 8. products tablosundaki gecersiz producer_id'leri temizle
DELETE FROM products 
WHERE producer_id NOT IN (SELECT id FROM producers);

SET FOREIGN_KEY_CHECKS = 1;

-- Dogrulama sorgulari
SELECT 'coupons' as table_name, discount_type, COUNT(*) as count 
FROM coupons GROUP BY discount_type;

SELECT 'orders' as table_name, payment_method, COUNT(*) as count 
FROM orders GROUP BY payment_method;
