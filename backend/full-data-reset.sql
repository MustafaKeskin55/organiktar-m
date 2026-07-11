-- ============================================
-- ORGANIK TARIM - FULL DATA RESET & SEED
-- Tüm verileri temizler ve gerçekçi örnek veriler ekler
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Tüm tabloları temizle
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

-- Auto increment sıfırla
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

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. SITE AYARLARI
-- ============================================
INSERT INTO site_settings (site_name, site_description, contact_email, contact_phone, 
    commission_rate, min_order_amount, free_shipping_threshold, shipping_fee, tax_rate,
    maintenance_mode, allow_registration, require_approval_for_products, 
    auto_approve_producers, currency, language, timezone, created_at, updated_at)
VALUES 
('Organik Tarım', 'Doğal ve organik ürünlerin buluşma noktası', 'info@organiktarim.com', '0850 123 45 67',
 5.00, 50.00, 250.00, 29.99, 20.00,
 FALSE, TRUE, TRUE, FALSE, 'TRY', 'tr', 'Europe/Istanbul', NOW(), NOW());

-- ============================================
-- 2. ÖDEME AYARLARI
-- ============================================
INSERT INTO payment_settings (bank_name, account_holder, iban, account_number, branch_code,
    payment_gateway, merchant_id, is_test_mode, is_active, allow_installments,
    max_installment_count, min_installment_amount, supported_cards, created_at, updated_at)
VALUES 
('Ziraat Bankası', 'Organik Tarım A.Ş.', 'TR000012345678901234567890', '12345678', '0123',
 'NONE', NULL, TRUE, TRUE, FALSE,
 6, 100.00, 'Visa,MasterCard,Amex', NOW(), NOW());

-- ============================================
-- 3. YÖNETİCİLER (3 Farklı Yetki)
-- ============================================
-- SUPER_ADMIN: Tam yetki
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at) VALUES
('Ahmet Yönetici', 'yonetici@organiktarim.com', 'M.ustafa536', '0532 111 22 33', 'SUPER_ADMIN', TRUE, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW());

-- MANAGER: Sadece okuma
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at) VALUES
('Mehmet Müdür', 'mudur@organiktarim.com', 'M.ustafa536', '0533 222 33 44', 'MANAGER', TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW());

-- FINANCE: Mali işlemler
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at) VALUES
('Ayşe Maliyeci', 'maliyeci@organiktarim.com', 'M.ustafa536', '0534 333 44 55', 'FINANCE', TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW());

-- ============================================
-- 4. ÜRETİCİLER (Çiftçiler ve Üreticiler)
-- ============================================
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at) VALUES
('Ali Çiftçi', 'ali@ciftci.com', 'mustafa2', '0541 111 11 11', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 50 DAY), NOW()),
('Ayşe Yılmaz', 'ayse@yilmaz.com', 'mustafa2', '0542 222 22 22', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 48 DAY), NOW()),
('Mehmet Kaya', 'mehmet@kaya.com', 'mustafa2', '0543 333 33 33', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
('Fatma Şahin', 'fatma@sahin.com', 'mustafa2', '0544 444 44 44', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 42 DAY), NOW()),
('Hasan Öztürk', 'hasan@ozturk.com', 'mustafa2', '0545 555 55 55', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 40 DAY), NOW()),
('Zeynep Demir', 'zeynep@demir.com', 'mustafa2', '0546 666 66 66', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 38 DAY), NOW()),
('İbrahim Can', 'ibrahim@can.com', 'mustafa2', '0547 777 77 77', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),
('Emine Aydın', 'emine@aydin.com', 'mustafa2', '0548 888 88 88', 'PRODUCER', TRUE, DATE_SUB(NOW(), INTERVAL 32 DAY), NOW());

-- Üretici ID'leri @producer_id_1 ile @producer_id_8 arası (4-11)

-- ============================================
-- 5. TÜKETİCİLER (Müşteriler)
-- ============================================
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at) VALUES
('Burak Yılmaz', 'burak@yilmaz.com', 'mustafa2', '0551 111 11 11', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 28 DAY), NOW()),
('Ceren Aktaş', 'ceren@aktas.com', 'mustafa2', '0552 222 22 22', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 26 DAY), NOW()),
('Deniz Korkmaz', 'deniz@korkmaz.com', 'mustafa2', '0553 333 33 33', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 24 DAY), NOW()),
('Ecem Sarı', 'ecem@sari.com', 'mustafa2', '0554 444 44 44', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 22 DAY), NOW()),
('Furkan Kılıç', 'furkan@kilic.com', 'mustafa2', '0555 555 55 55', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('Gamze Taş', 'gamze@tas.com', 'mustafa2', '0556 666 66 66', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
('Hakan Çelik', 'hakan@celik.com', 'mustafa2', '0557 777 77 77', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
('İrem Arslan', 'irem@arslan.com', 'mustafa2', '0558 888 88 88', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
('Kerem Yıldız', 'kerem@yildiz.com', 'mustafa2', '0559 999 99 99', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('Leyla Koç', 'leyla@koc.com', 'mustafa2', '0560 000 00 00', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Murat Şen', 'murat@sen.com', 'mustafa2', '0561 111 11 11', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('Nisa Gül', 'nisa@gul.com', 'mustafa2', '0562 222 22 22', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
('Onur Peker', 'onur@peker.com', 'mustafa2', '0563 333 33 33', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Pelin Doğan', 'pelin@dogan.com', 'mustafa2', '0564 444 44 44', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('Serkan Uysal', 'serkan@uysal.com', 'mustafa2', '0565 555 55 55', 'CONSUMER', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- ============================================
-- 6. ADRESLER
-- ============================================
-- Tüketiciler için adresler (ID 12-26 arası tüketiciler)
INSERT INTO addresses (title, city, district, neighborhood, full_address, is_default, user_id) VALUES
('Ev', 'İstanbul', 'Kadıköy', 'Moda', 'Moda Caddesi No:15 D:3', TRUE, 12),
('İş', 'İstanbul', 'Şişli', 'Mecidiyeköy', 'Büyükdere Caddesi No:45 Kat:2', FALSE, 12),
('Ev', 'Ankara', 'Çankaya', 'Kızılay', 'Gazi Mustafa Kemal Bulvarı No:25 D:12', TRUE, 13),
('Yazlık', 'Antalya', 'Muratpaşa', 'Kaleiçi', 'Hesapçı Sokak No:12', FALSE, 13),
('Ev', 'İzmir', 'Karşıyaka', 'Bostanlı', 'Bostanlı Bulvarı No:156 D:5', TRUE, 14),
('Ev', 'Bursa', 'Nilüfer', 'İhsaniye', 'İzmir Yolu Caddesi No:88', TRUE, 15),
('İş', 'İstanbul', 'Beşiktaş', 'Levent', 'Levent Caddesi No:98 D:15', TRUE, 16),
('Ev', 'Adana', 'Seyhan', 'Çınarlı', 'Çınarlı Mahallesi No:45', TRUE, 17),
('Ev', 'Trabzon', 'Ortahisar', 'Atapark', 'Atapark Caddesi No:23', TRUE, 18),
('Yazlık', 'Muğla', 'Bodrum', 'Yalıkavak', 'Yalıkavak Marina No:45', TRUE, 19),
('Ev', 'Eskişehir', 'Odunpazarı', 'Çankaya', 'Çankaya Caddesi No:67', TRUE, 20),
('Ev', 'Konya', 'Selçuklu', 'Bosna', 'Bosna Hersek Caddesi No:89', TRUE, 21),
('Ev', 'Gaziantep', 'Şahinbey', 'Karataş', 'Karataş Mahallesi No:34', TRUE, 22),
('Ev', 'Kayseri', 'Melikgazi', 'Kocasinan', 'Kocasinan Bulvarı No:56', TRUE, 23),
('Ev', 'Samsun', 'İlkadım', 'Kale', 'Kale Mahallesi No:78', TRUE, 24),
('Ev', 'Diyarbakır', 'Bağlar', 'Bağcılar', 'Bağcılar Caddesi No:90', TRUE, 25),
('Ev', 'Mersin', 'Yenişehir', 'Çamlıbel', 'Çamlıbel Mahallesi No:12', TRUE, 26);

-- ============================================
-- 7. ÜRÜNLER (8 Üretici × 3-5 Ürün = 30+ Ürün)
-- ============================================

-- Ali Çiftçi - Sebzeler (ID: 4)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Domates', 'Doğal, ilaçsız, güneşte olgunlaşmış domates', 15.00, 'kg', 150, 'SEBZE', TRUE, 4, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
('Salatalık', 'Bahçeden toplanmış taze salatalık', 12.00, 'kg', 120, 'SEBZE', TRUE, 4, DATE_SUB(NOW(), INTERVAL 19 DAY), NOW()),
('Biber', 'Acı ve tatlı karışık biber çeşitleri', 20.00, 'kg', 80, 'SEBZE', TRUE, 4, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
('Patlıcan', 'Köy patlıcanı, tohumdan yetiştirilmiş', 18.00, 'kg', 60, 'SEBZE', TRUE, 4, DATE_SUB(NOW(), INTERVAL 17 DAY), NOW());

-- Ayşe Yılmaz - Meyveler (ID: 5)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Elma', 'Starking elma, ağaçtan yeni toplandı', 12.50, 'kg', 200, 'MEYVE', TRUE, 5, DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
('Armut', 'Deveci armudu, tatlı ve sulu', 15.00, 'kg', 150, 'MEYVE', TRUE, 5, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
('Üzüm', 'Çekirdeksiz sultani üzüm', 18.00, 'kg', 100, 'MEYVE', TRUE, 5, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
('İncir', 'Siyah incir, kurutmalık ve yenilik', 25.00, 'kg', 80, 'MEYVE', TRUE, 5, DATE_SUB(NOW(), INTERVAL 13 DAY), NOW());

-- Mehmet Kaya - Süt Ürünleri (ID: 6)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Köy Peyniri', 'Keçi sütünden yapılmış beyaz peynir', 85.00, 'kg', 50, 'SUT', TRUE, 6, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
('Tereyağı', 'Köy tereyağı, kaya tuzu ile', 120.00, 'kg', 40, 'SUT', TRUE, 6, DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),
('Yoğurt', 'Cacıklık yoğurt, katkısız', 35.00, 'kg', 60, 'SUT', TRUE, 6, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
('Ayran', 'Köy ayranı, mayalı', 15.00, 'lt', 100, 'SUT', TRUE, 6, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW());

-- Fatma Şahin - Et ve Yumurta (ID: 7)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Köy Yumurtası', 'Serbest gezen tavuk yumurtası', 3.50, 'adet', 500, 'ET', TRUE, 7, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
('Tavuk Eti', 'Doğal beslenmiş tavuk', 65.00, 'kg', 80, 'ET', TRUE, 7, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
('Köy Tavuğu', 'Bütün tavuk, kesimlik', 85.00, 'adet', 30, 'ET', TRUE, 7, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW());

-- Hasan Öztürk - Bakliyat (ID: 8)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Mercimek', 'Kırmızı mercimek, yerli üretim', 28.00, 'kg', 200, 'BAKLIYAT', TRUE, 8, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('Bulgur', 'Köy bulguru, dövme', 22.00, 'kg', 150, 'BAKLIYAT', TRUE, 8, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
('Nohut', 'İri nohut, haşlamalık', 32.00, 'kg', 120, 'BAKLIYAT', TRUE, 8, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
('Kuru Fasulye', 'Barbunya fasulye', 45.00, 'kg', 100, 'BAKLIYAT', TRUE, 8, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- Zeynep Demir - Baharat ve Kuruyemiş (ID: 9)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Ceviz', 'Kaman cevizi, taze', 120.00, 'kg', 80, 'DIGER', TRUE, 9, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('Fındık', 'Giresun fındığı', 150.00, 'kg', 60, 'DIGER', TRUE, 9, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('Kekik', 'Daş kekiği, doğal toplama', 45.00, 'paket', 200, 'BAHARAT', TRUE, 9, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('Pul Biber', 'Maraş biberi, tatlı ve acı karışık', 55.00, 'kg', 150, 'BAHARAT', TRUE, 9, NOW(), NOW());

-- İbrahim Can - Bal ve Reçel (ID: 10)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Çiçek Balı', 'Yayla balı, süzme', 180.00, 'kg', 40, 'DIGER', TRUE, 10, NOW(), NOW()),
('Kayısı Reçeli', 'Malatya kayısısından', 65.00, 'kavanoz', 50, 'DIGER', TRUE, 10, NOW(), NOW()),
('Vişne Reçeli', 'Ev yapımı vişne reçeli', 55.00, 'kavanoz', 40, 'DIGER', TRUE, 10, NOW(), NOW()),
('Salça', 'Domates ve biber salçası', 45.00, 'kg', 60, 'DIGER', TRUE, 10, NOW(), NOW());

-- Emine Aydın - Zeytin ve Zeytinyağı (ID: 11)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Sızma Zeytinyağı', 'Erken hasat, soğuk sıkım', 220.00, 'lt', 30, 'DIGER', TRUE, 11, NOW(), NOW()),
('Naturel Sızma', 'Gold seri zeytinyağı', 180.00, 'lt', 40, 'DIGER', TRUE, 11, NOW(), NOW()),
('Sele Zeytin', 'Gemlik sele zeytini', 65.00, 'kg', 50, 'DIGER', TRUE, 11, NOW(), NOW()),
('Çizme Zeytin', 'Kahvaltılık çizme zeytin', 55.00, 'kg', 60, 'DIGER', TRUE, 11, NOW(), NOW());

-- Onay bekleyen ürünler (örnek)
INSERT INTO products (name, description, price, unit, stock, category, is_organic, producer_id, created_at, updated_at) VALUES
('Organik Patates', 'Dağ patatesi, topraklı', 12.00, 'kg', 200, 'SEBZE', TRUE, 4, NOW(), NOW()),
('Ihlamur', 'Dağ ıhlamuru', 35.00, 'paket', 30, 'DIGER', TRUE, 9, NOW(), NOW());

-- ============================================
-- 8. ÜRÜN GÖRSELLERİ
-- ============================================
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'),
(2, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400'),
(3, 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400'),
(4, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400'),
(5, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'),
(6, 'https://images.unsplash.com/photo-1631160299919-6a175aa6d189?w=400'),
(7, 'https://images.unsplash.com/photo-1537640538965-1756cd58090b?w=400'),
(8, 'https://images.unsplash.com/photo-1601004893134-5e8a788f1510?w=400');

-- ============================================
-- 9. FAVORİLER (Beğeniler)
-- ============================================
-- Her tüketici 2-3 ürün favorilerine eklesin
INSERT INTO user_favorites (user_id, product_id) VALUES
(12, 5), (12, 6), (12, 9),  -- Burak
(13, 1), (13, 5),           -- Ceren
(14, 2), (14, 3), (14, 7),  -- Deniz
(15, 8), (15, 10),          -- Ecem
(16, 4), (16, 11), (16, 15), -- Furkan
(17, 6), (17, 9),           -- Gamze
(18, 3), (18, 12), (18, 14), -- Hakan
(19, 7), (19, 8),           -- İrem
(20, 1), (20, 2), (20, 5),  -- Kerem
(21, 10), (21, 13),         -- Leyla
(22, 11), (22, 14), (22, 16), -- Murat
(23, 4), (23, 6),           -- Nisa
(24, 9), (24, 12), (24, 15), -- Onur
(25, 8), (25, 11),          -- Pelin
(26, 7), (26, 13), (26, 16); -- Serkan

-- ============================================
-- 10. SİPARİŞLER (30+ Gerçekçi Sipariş)
-- ============================================
-- Son 30 gün içinde dağılmış siparişler
-- Format: user_id, address_id, total_amount, delivery_fee, status, created_at

-- Bu hafta siparişler (aktif)
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method, estimated_delivery, created_at) VALUES
('ORD-20250301001', 12, 1, 125.50, 29.99, 'BEKLEMEDE', 'TRANSFER', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD-20250301002', 13, 3, 89.90, 0.00, 'ONAYLANDI', 'CARD', DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ORD-20250301003', 14, 5, 245.00, 0.00, 'HAZIRLANIYOR', 'CARD', DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ORD-20250301004', 15, 6, 67.50, 29.99, 'BEKLEMEDE', 'COD', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Geçen hafta siparişler (teslim edildi)
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method, estimated_delivery, created_at) VALUES
('ORD-20250224001', 16, 7, 178.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('ORD-20250224002', 17, 8, 92.50, 29.99, 'TESLIM_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY)),
('ORD-20250224003', 18, 9, 156.80, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('ORD-20250224004', 19, 10, 203.50, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
('ORD-20250224005', 20, 11, 78.90, 29.99, 'TESLIM_EDILDI', 'COD', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD-20250224006', 21, 12, 334.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Daha eski siparişler (geçmiş 30 gün)
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method, estimated_delivery, created_at) VALUES
('ORD-20250217001', 22, 13, 145.00, 29.99, 'TESLIM_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('ORD-20250217002', 23, 14, 89.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
('ORD-20250217003', 24, 15, 267.50, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),
('ORD-20250217004', 25, 16, 56.00, 29.99, 'TESLIM_EDILDI', 'COD', DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('ORD-20250217005', 26, 17, 189.90, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY)),
('ORD-20250210001', 12, 1, 234.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY)),
('ORD-20250210002', 13, 3, 67.50, 29.99, 'TESLIM_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 17 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('ORD-20250210003', 14, 5, 198.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY)),
('ORD-20250210004', 15, 6, 123.50, 0.00, 'TESLIM_EDILDI', 'COD', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('ORD-20250210005', 16, 7, 289.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 17 DAY)),
('ORD-20250203001', 17, 8, 145.50, 29.99, 'TESLIM_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 24 DAY), DATE_SUB(NOW(), INTERVAL 27 DAY)),
('ORD-20250203002', 18, 9, 78.00, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 23 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
('ORD-20250203003', 19, 10, 223.50, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
('ORD-20250203004', 20, 11, 91.00, 29.99, 'TESLIM_EDILDI', 'COD', DATE_SUB(CURDATE(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 24 DAY)),
('ORD-20250203005', 21, 12, 178.50, 0.00, 'TESLIM_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY));

-- İptal edilmiş siparişler (örnek)
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method, estimated_delivery, created_at) VALUES
('ORD-20250224007', 22, 13, 156.00, 29.99, 'IPTAL_EDILDI', 'TRANSFER', DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD-20250217006', 23, 14, 89.50, 0.00, 'IPTAL_EDILDI', 'CARD', DATE_SUB(CURDATE(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- Yolda olan siparişler (estimated_delivery DATE tipi - CURDATE kullan)
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method, estimated_delivery, created_at) VALUES
('ORD-20250301005', 24, 15, 312.00, 0.00, 'YOLDA', 'CARD', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD-20250301006', 25, 16, 145.50, 29.99, 'YOLDA', 'TRANSFER', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================
-- 11. SİPARİŞ ÜRÜNLERİ (Order Items)
-- ============================================
-- Her siparişte 2-4 ürün olsun (product_id: 1-34 arası)

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Sipariş 1 (Beklemede - 3 ürün: 1, 2, 3)
(1, 1, 3, 15.00), (1, 2, 2, 12.00), (1, 3, 1, 20.00),

-- Sipariş 2 (Onaylandı - 2 ürün: 4, 5)
(2, 4, 2, 18.00), (2, 5, 4, 12.50),

-- Sipariş 3 (Hazırlanıyor - 4 ürün: 6, 7, 8, 9)
(3, 6, 2, 15.00), (3, 7, 2, 65.00), (3, 8, 2, 28.00), (3, 9, 1, 120.00),

-- Sipariş 4 (Beklemede - 2 ürün: 10, 11)
(4, 10, 1, 150.00), (4, 11, 1, 150.00),

-- Sipariş 5-6 (Teslim edildi - 2'şer ürün)
(5, 12, 1, 35.00), (5, 13, 3, 18.00),
(6, 14, 1, 25.00), (6, 15, 1, 35.00),

-- Sipariş 7-10
(7, 16, 2, 45.00), (7, 17, 10, 3.50), (7, 18, 2, 85.00),
(8, 19, 2, 65.00), (8, 20, 1, 85.00),
(9, 21, 1, 85.00), (9, 22, 1, 120.00), (9, 23, 1, 220.00),
(10, 24, 1, 55.00), (10, 25, 2, 28.00), (10, 26, 2, 22.00),

-- Sipariş 11-15
(11, 27, 3, 32.00), (11, 28, 1, 55.00),
(12, 29, 2, 180.00), (12, 30, 1, 65.00),
(13, 31, 2, 55.00), (13, 32, 1, 65.00), (13, 33, 1, 220.00),
(14, 30, 2, 180.00), (14, 1, 2, 15.00),
(15, 2, 3, 12.00), (15, 3, 2, 20.00),

-- Sipariş 16-20
(16, 4, 2, 18.00), (16, 5, 3, 12.50), (16, 6, 1, 15.00),
(17, 7, 1, 65.00), (17, 8, 1, 28.00),
(18, 9, 1, 120.00), (18, 10, 1, 150.00), (18, 11, 1, 150.00),
(19, 12, 1, 35.00), (19, 13, 2, 18.00),
(20, 14, 1, 25.00), (20, 15, 2, 35.00),

-- Sipariş 21-25
(21, 16, 1, 45.00), (21, 17, 5, 3.50),
(22, 18, 2, 85.00), (22, 19, 2, 65.00), (22, 20, 1, 85.00),
(23, 21, 2, 85.00), (23, 22, 1, 120.00),
(24, 23, 1, 220.00), (24, 24, 2, 55.00),
(25, 25, 3, 28.00), (25, 26, 3, 22.00), (25, 27, 2, 32.00);

-- ============================================
-- 12. FİNANSAL RAPORLAR (Son 30 Gün)
-- ============================================
INSERT INTO financial_reports (report_date, report_type, total_orders, total_revenue, 
    total_commission, net_revenue, total_shipping, new_users, new_producers, new_products, 
    avg_order_value, created_at) VALUES

-- Günlük raporlar (son 7 gün)
(DATE_SUB(CURDATE(), INTERVAL 0 DAY), 'DAILY', 4, 628.90, 31.44, 597.46, 59.98, 1, 0, 0, 157.23, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'DAILY', 2, 312.00, 15.60, 296.40, 0.00, 0, 0, 0, 156.00, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'DAILY', 6, 824.50, 41.23, 783.27, 59.98, 2, 0, 0, 137.42, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'DAILY', 3, 445.00, 22.25, 422.75, 29.99, 0, 1, 2, 148.33, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'DAILY', 5, 734.80, 36.74, 698.06, 29.99, 1, 0, 1, 146.96, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'DAILY', 4, 512.30, 25.62, 486.68, 59.98, 0, 0, 0, 128.08, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'DAILY', 3, 398.50, 19.93, 378.58, 29.99, 1, 0, 0, 132.83, NOW()),

-- Haftalık raporlar
(DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'WEEKLY', 27, 3856.00, 192.80, 3663.20, 269.90, 5, 1, 3, 142.81, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'WEEKLY', 22, 3245.50, 162.28, 3083.23, 209.93, 4, 0, 2, 147.52, NOW()),
(DATE_SUB(CURDATE(), INTERVAL 21 DAY), 'WEEKLY', 19, 2890.00, 144.50, 2745.50, 179.96, 3, 1, 1, 152.11, NOW()),

-- Aylık rapor
(DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'MONTHLY', 68, 9991.50, 499.58, 9491.93, 659.79, 12, 2, 6, 147.00, NOW());

-- ============================================
-- SON KONTROL
-- ============================================
SELECT 
    'YÖNETİCİLER' as tablo, COUNT(*) as kayit_sayisi FROM users WHERE type IN ('SUPER_ADMIN', 'MANAGER', 'FINANCE')
UNION ALL
SELECT 'ÜRETİCİLER', COUNT(*) FROM users WHERE type = 'PRODUCER'
UNION ALL
SELECT 'TÜKETİCİLER', COUNT(*) FROM users WHERE type = 'CONSUMER'
UNION ALL
SELECT 'ÜRÜNLER', COUNT(*) FROM products
UNION ALL
SELECT 'SİPARİŞLER', COUNT(*) FROM orders
UNION ALL
SELECT 'ADRESLER', COUNT(*) FROM addresses
UNION ALL
SELECT 'FAVORİLER', COUNT(*) FROM user_favorites
UNION ALL
SELECT 'RAPORLAR', COUNT(*) FROM financial_reports;

-- Foreign key kontrollerini tekrar aktif et
SET FOREIGN_KEY_CHECKS = 1;
