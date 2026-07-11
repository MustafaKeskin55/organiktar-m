-- ============================================
-- ORGANIK TARIM - SADECE VERİ EKLEME (Foreign Key Kontrolü Kapalı)
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. TÜM VERİLERİ TEMİZLE
-- ============================================
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM product_images;
DELETE FROM user_favorites;
DELETE FROM addresses;
DELETE FROM products;
DELETE FROM financial_reports;
DELETE FROM payment_settings;
DELETE FROM site_settings;
DELETE FROM users;

ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE product_images AUTO_INCREMENT = 1;
ALTER TABLE user_favorites AUTO_INCREMENT = 1;
ALTER TABLE addresses AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE financial_reports AUTO_INCREMENT = 1;
ALTER TABLE payment_settings AUTO_INCREMENT = 1;
ALTER TABLE site_settings AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- ============================================
-- 2. ADMİNLER (3 Tip Yönetici)
-- ============================================
INSERT INTO users (name, email, password, phone, type, created_at, updated_at) VALUES
('Ahmet Yönetici', 'yonetici@organiktarim.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 111 22 33', 'SUPER_ADMIN', DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
('Mehmet Müdür', 'mudur@organiktarim.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 222 33 44', 'MANAGER', DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
('Ayşe Maliyeci', 'maliyeci@organiktarim.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0534 333 44 55', 'FINANCE', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW());

-- ============================================
-- 3. ÜRETİCİLER (8 Üretici)
-- ============================================
INSERT INTO users (name, email, password, phone, type, created_at, updated_at) VALUES
('Ali Çiftçi', 'ali@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 123 45 67', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 50 DAY), NOW()),
('Ayşe Yılmaz', 'ayse@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 234 56 78', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
('Mehmet Kaya', 'mehmet@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 345 67 89', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 40 DAY), NOW()),
('Fatma Şahin', 'fatma@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 456 78 90', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),
('Hasan Öztürk', 'hasan@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 567 89 01', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
('Zeynep Demir', 'zeynep@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 678 90 12', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
('İbrahim Can', 'ibrahim@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 789 01 23', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('Emine Aydın', 'emine@organik.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0533 890 12 34', 'PRODUCER', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW());

-- ============================================
-- 4. TÜKETİCİLER (15 Tüketici)
-- ============================================
INSERT INTO users (name, email, password, phone, type, created_at, updated_at) VALUES
('Burak Yılmaz', 'burak@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 111 11 11', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
('Ceren Kaya', 'ceren@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 222 22 22', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 28 DAY), NOW()),
('Deniz Özdemir', 'deniz@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 333 33 33', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 26 DAY), NOW()),
('Ecem Şahin', 'ecem@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 444 44 44', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 24 DAY), NOW()),
('Furkan Aydın', 'furkan@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 555 55 55', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 22 DAY), NOW()),
('Gamze Koç', 'gamze@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 666 66 66', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('Hakan Demir', 'hakan@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 777 77 77', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
('İrem Can', 'irem@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 888 88 88', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
('Kerem Yıldız', 'kerem@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 999 99 99', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
('Leyla Öztürk', 'leyla@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 000 00 00', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('Murat Kaya', 'murat@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 121 21 21', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Nisa Yılmaz', 'nisa@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 232 32 32', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('Onur Demir', 'onur@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 343 43 43', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
('Pelin Aydın', 'pelin@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 454 54 54', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Serkan Koç', 'serkan@gmail.com', '$2a$10$N9qoRWAT.R.XNNv3x8xV0.ZKUjWqJ7YJ2E5G3O8K1Q4L6P2M8N6S', '0532 565 65 65', 'CONSUMER', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- ============================================
-- 5. ADRESLER (Üreticiler için)
-- ============================================
INSERT INTO addresses (title, city, district, neighborhood, full_address, is_default, user_id) VALUES
('Çiftlik', 'Ankara', 'Ayaş', 'Kirazlı', 'Kirazlı Köyü No:45', TRUE, 4),
('Bahçe', 'Isparta', 'Eğirdir', 'Bahçelievler', 'Bahçelievler Mah. No:12', TRUE, 5),
('Mandıra', 'Konya', 'Karatay', 'Mevlana', 'Mevlana Mah. Çiftlik Cad. No:23', TRUE, 6),
('Kümes', 'Bursa', 'Osmangazi', 'Çekirge', 'Çekirge Mah. No:78', TRUE, 7),
('Tarla', 'Eskişehir', 'Odunpazarı', 'Kurtuluş', 'Kurtuluş Mah. No:34', TRUE, 8),
('Bahçe', 'Antalya', 'Korkuteli', 'Cumhuriyet', 'Cumhuriyet Mah. No:56', TRUE, 9),
('Arıcılık', 'Muğla', 'Menteşe', 'Karamehmet', 'Karamehmet Mah. No:89', TRUE, 10),
('Zeytinlik', 'Balıkesir', 'Ayvalık', 'Cunda', 'Cunda Adası No:12', TRUE, 11);

-- ============================================
-- 6. ÜRÜNLER (Sadece 20 ürün - ID 1-20)
-- ============================================
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Domates', 'Doğal, ilaçsız domates', 15.00, 'kg', 150, 'SEBZE', TRUE, 4, NOW(), NOW()),
('Salatalık', 'Taze salatalık', 12.00, 'kg', 120, 'SEBZE', TRUE, 4, NOW(), NOW()),
('Biber', 'Köy biberi', 20.00, 'kg', 80, 'SEBZE', TRUE, 4, NOW(), NOW()),
('Patlıcan', 'Köy patlıcanı', 18.00, 'kg', 60, 'SEBZE', TRUE, 4, NOW(), NOW()),
('Elma', 'Starking elma', 12.50, 'kg', 200, 'MEYVE', TRUE, 5, NOW(), NOW()),
('Armut', 'Deveci armudu', 15.00, 'kg', 150, 'MEYVE', TRUE, 5, NOW(), NOW()),
('Üzüm', 'Çekirdeksiz üzüm', 18.00, 'kg', 100, 'MEYVE', TRUE, 5, NOW(), NOW()),
('İncir', 'Siyah incir', 25.00, 'kg', 80, 'MEYVE', TRUE, 5, NOW(), NOW()),
('Köy Peyniri', 'Keçi sütünden peynir', 85.00, 'kg', 50, 'SUT', TRUE, 6, NOW(), NOW()),
('Tereyağı', 'Köy tereyağı', 120.00, 'kg', 40, 'SUT', TRUE, 6, NOW(), NOW()),
('Yoğurt', 'Köy yoğurdu', 35.00, 'kg', 60, 'SUT', TRUE, 6, NOW(), NOW()),
('Köy Yumurtası', 'Serbest gezen tavuk yumurtası', 3.50, 'adet', 500, 'ET', TRUE, 7, NOW(), NOW()),
('Tavuk Eti', 'Doğal tavuk', 65.00, 'kg', 80, 'ET', TRUE, 7, NOW(), NOW()),
('Mercimek', 'Kırmızı mercimek', 28.00, 'kg', 200, 'BAKLIYAT', TRUE, 8, NOW(), NOW()),
('Bulgur', 'Köy bulguru', 22.00, 'kg', 150, 'BAKLIYAT', TRUE, 8, NOW(), NOW()),
('Nohut', 'İri nohut', 32.00, 'kg', 120, 'BAKLIYAT', TRUE, 8, NOW(), NOW()),
('Ceviz', 'Kaman cevizi', 120.00, 'kg', 80, 'DIGER', TRUE, 9, NOW(), NOW()),
('Fındık', 'Giresun fındığı', 150.00, 'kg', 60, 'DIGER', TRUE, 9, NOW(), NOW()),
('Çiçek Balı', 'Yayla balı', 180.00, 'kg', 40, 'DIGER', TRUE, 10, NOW(), NOW()),
('Sızma Zeytinyağı', 'Erken hasat zeytinyağı', 220.00, 'lt', 30, 'DIGER', TRUE, 11, NOW(), NOW());

-- ============================================
-- 7. SİPARİŞLER (10 sipariş)
-- ============================================
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method, estimated_delivery, created_at) VALUES
('ORD-20250301001', 12, 1, 125.50, 29.99, 'BEKLEMEDE', 'TRANSFER', DATE_ADD(CURDATE(), INTERVAL 3 DAY), NOW()),
('ORD-20250301002', 13, 1, 89.90, 0.00, 'ONAYLANDI', 'CARD', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW()),
('ORD-20250301003', 14, 1, 245.00, 0.00, 'HAZIRLANIYOR', 'CARD', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW()),
('ORD-20250301004', 15, 1, 67.50, 29.99, 'BEKLEMEDE', 'COD', DATE_ADD(CURDATE(), INTERVAL 3 DAY), NOW()),
('ORD-20250224001', 16, 1, 178.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('ORD-20250224002', 17, 1, 92.50, 29.99, 'TESLIM_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('ORD-20250224003', 18, 1, 156.80, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD-20250217001', 19, 1, 145.00, 29.99, 'TESLIM_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
('ORD-20250217002', 20, 1, 89.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),
('ORD-20250217003', 21, 1, 267.50, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

-- ============================================
-- 8. SİPARİŞ ÜRÜNLERİ (Sadece 1-20 arası product_id)
-- ============================================
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 3, 15.00), (1, 2, 2, 12.00), (1, 3, 1, 20.00),
(2, 4, 2, 18.00), (2, 5, 4, 12.50),
(3, 6, 2, 15.00), (3, 7, 2, 65.00), (3, 8, 2, 28.00),
(4, 9, 1, 85.00), (4, 10, 1, 120.00),
(5, 11, 5, 3.50), (5, 12, 2, 65.00),
(6, 13, 3, 18.00), (6, 14, 2, 28.00),
(7, 15, 4, 32.00), (7, 16, 3, 22.00),
(8, 17, 2, 120.00), (8, 18, 1, 150.00),
(9, 19, 1, 180.00), (9, 20, 1, 220.00),
(10, 1, 2, 15.00), (10, 5, 3, 12.50);

-- ============================================
-- 9. AYARLAR
-- ============================================
INSERT INTO site_settings (commission_rate, shipping_fee, min_order_amount, maintenance_mode, created_at, updated_at) 
VALUES (5.00, 29.99, 50.00, FALSE, NOW(), NOW());

INSERT INTO payment_settings (bank_name, account_holder, iban, is_active, created_at) 
VALUES ('Ziraat Bankası', 'Organik Tarım A.Ş.', 'TR000012345678901234567890', TRUE, NOW());

-- ============================================
-- 10. SONUÇ KONTROLÜ
-- ============================================
SELECT 'ADMİNLER' as tablo, COUNT(*) as kayit FROM users WHERE type IN ('SUPER_ADMIN', 'MANAGER', 'FINANCE')
UNION ALL SELECT 'ÜRETİCİLER', COUNT(*) FROM users WHERE type = 'PRODUCER'
UNION ALL SELECT 'TÜKETİCİLER', COUNT(*) FROM users WHERE type = 'CONSUMER'
UNION ALL SELECT 'ÜRÜNLER', COUNT(*) FROM products
UNION ALL SELECT 'SİPARİŞLER', COUNT(*) FROM orders;

SET FOREIGN_KEY_CHECKS = 1;
