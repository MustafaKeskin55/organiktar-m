-- ============================================
-- ÇİFTÇİDENKAPINA - TÜM VERİTABANI YAPISI
-- 100 Ürün, 10 Kullanıcı, Tam Sipariş Sistemi
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Tabloları temizle (varsa)
DROP TABLE IF EXISTS coupon_usage_logs;
DROP TABLE IF EXISTS coupon_users;
DROP TABLE IF EXISTS coupon_products;
DROP TABLE IF EXISTS coupon_categories;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS admin_broadcast_recipients;
DROP TABLE IF EXISTS admin_broadcasts;
DROP TABLE IF EXISTS email_templates;
DROP TABLE IF EXISTS user_retention_plans;
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS scheduled_emails;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_favorites;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS site_content;
DROP TABLE IF EXISTS payment_settings;
DROP TABLE IF EXISTS financial_reports;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. KULLANICILAR TABLOSU (10 Kullanıcı)
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    type ENUM('CONSUMER', 'PRODUCER', 'SUPER_ADMIN', 'MANAGER', 'FINANCE') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    force_password_change BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT NULL,
    last_login_date DATETIME DEFAULT NULL,
    login_count INT DEFAULT 0,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10 Kullanıcı (Admin, Finans, Üretici, Tüketici)
INSERT INTO users (id, name, email, password, phone, type, is_active, login_count, registration_date) VALUES
(1, 'Super Admin', 'admin@ciftcidenkapina.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0555 111 11 11', 'SUPER_ADMIN', TRUE, 150, '2024-01-01'),
(2, 'Maliye Müdürü', 'finance@ciftcidenkapina.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0555 222 22 22', 'FINANCE', TRUE, 80, '2024-01-01'),
(3, 'Mehmet Yılmaz (Çiftçi)', 'mehmet.yilmaz@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 333 33 33', 'PRODUCER', TRUE, 45, '2024-01-15'),
(4, 'Ayşe Kaya (Çiftçi)', 'ayse.kaya@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 444 44 44', 'PRODUCER', TRUE, 32, '2024-02-01'),
(5, 'Ali Demir (Çiftçi)', 'ali.demir@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 555 55 55', 'PRODUCER', TRUE, 28, '2024-02-10'),
(6, 'Fatma Şahin (Müşteri)', 'fatma.sahin@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 666 66 66', 'CONSUMER', TRUE, 12, '2024-03-01'),
(7, 'Ahmet Özdemir (Müşteri)', 'ahmet.ozdemir@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 777 77 77', 'CONSUMER', TRUE, 8, '2024-03-05'),
(8, 'Zeynep Çelik (Müşteri)', 'zeynep.celik@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 888 88 88', 'CONSUMER', TRUE, 15, '2024-03-10'),
(9, 'Mustafa Aydın (Çiftçi)', 'mustafa.aydin@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 999 99 99', 'PRODUCER', TRUE, 20, '2024-03-15'),
(10, 'Elif Yıldız (Müşteri)', 'elif.yildiz@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 000 00 00', 'CONSUMER', TRUE, 5, '2024-03-20');

-- Şifreler: Hepsi için geçici şifre: TempPass123!

-- ============================================
-- 2. ADRESLER TABLOSU
-- ============================================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    address_line TEXT NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO addresses (user_id, title, full_name, phone, city, district, address_line, is_default) VALUES
(6, 'Ev', 'Fatma Şahin', '0544 666 66 66', 'İstanbul', 'Kadıköy', 'Caferağa Mah. Moda Cad. No:15 D:3', TRUE),
(6, 'İş', 'Fatma Şahin', '0544 666 66 66', 'İstanbul', 'Şişli', 'Bomonti Mah. Cumhuriyet Cad. No:45', FALSE),
(7, 'Ev', 'Ahmet Özdemir', '0544 777 77 77', 'Ankara', 'Çankaya', 'Kızılay Mah. Atatürk Bulv. No:12', TRUE),
(8, 'Ev', 'Zeynep Çelik', '0544 888 88 88', 'İzmir', 'Konak', 'Alsancak Mah. 1476 Sok. No:8 D:5', TRUE),
(10, 'Ev', 'Elif Yıldız', '0544 000 00 00', 'Bursa', 'Nilüfer', 'Özlüce Mah. Doğa Cad. No:25', TRUE);

-- ============================================
-- 3. KATEGORİLER TABLOSU
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (id, name, description) VALUES
(1, 'Meyve', 'Taze ve organik meyveler'),
(2, 'Sebze', 'Günlük hasat sebzeler'),
(3, 'Süt Ürünleri', 'Doğal ve katkısız süt ürünleri'),
(4, 'Kahvaltılık', 'Organik kahvaltı ürünleri'),
(5, 'Ekmek & Unlu Mamül', 'Taş fırın ve organik unlu mamüller'),
(6, 'Zeytin & Zeytinyağı', 'Soğuk sıkım zeytinyağları'),
(7, 'Bal & Reçel', 'Doğal bal ve ev yapımı reçeller'),
(8, 'Kuru Gıda', 'Bakliyat ve kuru gıdalar'),
(9, 'Baharat', 'Doğal baharatlar'),
(10, 'Organik Yumurta', 'Köy yumurtaları');

-- ============================================
-- 4. ÜRÜNLER TABLOSU (100 Ürün)
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    category_id BIGINT,
    producer_id BIGINT NOT NULL,
    is_organic BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    images JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (producer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 100 Ürün Ekleme (Çeşitli kategorilerden)
INSERT INTO products (name, description, price, stock, unit, category_id, producer_id, is_organic, is_active) VALUES
-- MEYVELER (1-20)
('Amasya Elması', 'Taze Amasya elması, doğal bahçelerden', 35.00, 150, 'kg', 1, 3, TRUE, TRUE),
('Sarı Dut', 'Organik sarı dut, tatlı ve lezzetli', 45.00, 80, 'kg', 1, 3, TRUE, TRUE),
('Yaban Mersini', 'Antioxidan zengini yaban mersini', 120.00, 50, 'kg', 1, 4, TRUE, TRUE),
('Çilek', 'Günlük hasat çilek', 60.00, 200, 'kg', 1, 4, TRUE, TRUE),
('Kiraz', 'Sapanca kirazı, iri ve sulu', 80.00, 120, 'kg', 1, 3, FALSE, TRUE),
('Şeftali', 'Bursa şeftalisi, aromatik', 55.00, 100, 'kg', 1, 9, TRUE, TRUE),
('Kayısı', 'Malatya kayısısı, kurutmalık', 40.00, 300, 'kg', 1, 9, TRUE, TRUE),
('Üzüm', 'Çekirdeksiz sultaniye üzümü', 35.00, 250, 'kg', 1, 3, FALSE, TRUE),
('Armut', 'Deveci armudu, iri meyve', 45.00, 180, 'kg', 1, 4, TRUE, TRUE),
('Erik', 'Yeşil erik, ekşi sevenlere', 50.00, 90, 'kg', 1, 9, FALSE, TRUE),
('İncir', 'Siyah incir, bal gibi tatlı', 70.00, 150, 'kg', 1, 3, TRUE, TRUE),
('Nar', 'Söğüt nar, tane tane', 55.00, 120, 'kg', 1, 9, TRUE, TRUE),
('Ayva', 'Ekmek ayvası, güveçlik', 30.00, 100, 'kg', 1, 4, FALSE, TRUE),
('Mandalina', 'Finike mandalinası, kokulu', 40.00, 400, 'kg', 1, 3, FALSE, TRUE),
('Portakal', 'Valencia portakalı, sulu', 35.00, 500, 'kg', 1, 3, FALSE, TRUE),
('Greyfurt', 'Kırmızı greyfurt, vitamin deposu', 50.00, 150, 'kg', 1, 9, TRUE, TRUE),
('Kivi', 'Yerli kivi, organik', 65.00, 200, 'kg', 1, 4, TRUE, TRUE),
(' Muz', 'Anamur muzu, yerli üretim', 45.00, 300, 'kg', 1, 5, FALSE, TRUE),
('Ananas', 'Dikenli ananas, tatlı', 90.00, 80, 'adet', 1, 5, FALSE, TRUE),
('Avokado', 'Avokado, püre yapımına uygun', 85.00, 120, 'kg', 1, 4, TRUE, TRUE),

-- SEBZELER (21-40)
('Domates', 'Salkım domates, salçalık ve yemeklik', 25.00, 500, 'kg', 2, 3, TRUE, TRUE),
('Salatalık', 'Kornişon salatalık, turşuluk', 20.00, 400, 'kg', 2, 4, TRUE, TRUE),
('Biber', 'Dolma biber, çarliston', 35.00, 350, 'kg', 2, 3, TRUE, TRUE),
('Patlıcan', 'Kemer patlıcan, az tohumlu', 30.00, 200, 'kg', 2, 4, TRUE, TRUE),
('Kabak', 'İnce kabak, mücverlik', 25.00, 250, 'kg', 2, 9, TRUE, TRUE),
('Havuç', 'Yerli havuç, havuç suyu için ideal', 22.00, 600, 'kg', 2, 3, TRUE, TRUE),
('Soğan', 'Kuru soğan, kışlık', 18.00, 1000, 'kg', 2, 9, FALSE, TRUE),
('Sarımsak', 'Taşköprü sarımsağı', 80.00, 300, 'kg', 2, 9, FALSE, TRUE),
('Patates', 'Yerli patates, haşlamalık', 20.00, 2000, 'kg', 2, 3, FALSE, TRUE),
('Ispanak', 'Yaprak ıspanak, temizlenmiş', 30.00, 150, 'demet', 2, 4, TRUE, TRUE),
('Roka', 'Doğal roka, bahçeden', 35.00, 120, 'demet', 2, 4, TRUE, TRUE),
('Marul', 'Kıvırcık marul, dolmalık', 25.00, 200, 'adet', 2, 3, TRUE, TRUE),
('Maydanoz', 'Kıvırcık maydanoz', 20.00, 150, 'demet', 2, 4, TRUE, TRUE),
('Dereotu', 'Taze dereotu', 18.00, 180, 'demet', 2, 4, TRUE, TRUE),
('Nane', 'Taze nane, kokulu', 15.00, 200, 'demet', 2, 3, TRUE, TRUE),
('Tere', 'Taze tere otu', 22.00, 150, 'demet', 2, 4, TRUE, TRUE),
('Pırasa', 'Pırasa, temizlenmiş', 35.00, 180, 'kg', 2, 3, TRUE, TRUE),
('Lahana', 'Beyaz lahana, turşuluk', 25.00, 250, 'kg', 2, 9, TRUE, TRUE),
('Karnabahar', 'Karnabahar, orta boy', 40.00, 120, 'adet', 2, 4, TRUE, TRUE),
('Brokoli', 'Brokoli, çiçekli', 45.00, 150, 'kg', 2, 3, TRUE, TRUE),

-- SÜT ÜRÜNLERİ (41-55)
('Köy Peyniri', 'Taze köy peyniri, beyaz', 180.00, 100, 'kg', 3, 4, TRUE, TRUE),
('Tulum Peyniri', 'Erzincan tulum peyniri', 220.00, 80, 'kg', 3, 9, TRUE, TRUE),
('Beyaz Peynir', 'Tam yağlı beyaz peynir', 160.00, 150, 'kg', 3, 3, TRUE, TRUE),
('Kaşar Peyniri', 'Eski kaşar, 12 ay olgunlaşmış', 250.00, 60, 'kg', 3, 9, TRUE, TRUE),
('Cecil Peyniri', 'Çeçil peyniri, örgülü', 200.00, 70, 'kg', 3, 4, TRUE, TRUE),
('Yoğurt', 'Ev yapımı yoğurt, katkısız', 80.00, 200, 'kg', 3, 3, TRUE, TRUE),
('Ayran', 'Taze ayran, sütlü', 35.00, 300, 'lt', 3, 4, TRUE, TRUE),
('Süt', 'Günlük sağım inek sütü', 25.00, 500, 'lt', 3, 3, TRUE, TRUE),
('Kefir', 'Probiyotik kefir', 45.00, 120, 'lt', 3, 4, TRUE, TRUE),
('Labne', 'Ev yapımı labne', 90.00, 80, 'kg', 3, 3, TRUE, TRUE),
('Krema', 'Çiğ krema, pastalık', 120.00, 60, 'kg', 3, 4, TRUE, TRUE),
('Tereyağı', 'Taze tereyağı, yayık', 250.00, 100, 'kg', 3, 9, TRUE, TRUE),
('Yayık Ayranı', 'Geleneksel yayık ayranı', 30.00, 150, 'lt', 3, 9, TRUE, TRUE),
('Manda Sütü', 'Manda sütü, yağlı', 40.00, 100, 'lt', 3, 5, TRUE, TRUE),
('Koyun Peyniri', 'Koyun sütünden beyaz peynir', 190.00, 80, 'kg', 3, 9, TRUE, TRUE),

-- KAHVALTILIK (56-70)
('Organik Bal', 'Süzme çiçek balı', 350.00, 150, 'kg', 4, 3, TRUE, TRUE),
('Petek Bal', 'Petekli bal, doğal', 400.00, 80, 'kg', 4, 4, TRUE, TRUE),
('Kaymak', 'Taze kaymak, süt kaymağı', 280.00, 100, 'kg', 4, 3, TRUE, TRUE),
('Tahin', 'Susam tahini, doğal', 180.00, 120, 'kg', 4, 9, TRUE, TRUE),
('Pekmez', 'Üzüm pekmezi, dut pekmezi', 120.00, 200, 'kg', 4, 3, TRUE, TRUE),
('Helva', 'Tahin helvası, ev yapımı', 150.00, 100, 'kg', 4, 9, TRUE, TRUE),
('Reçel', 'Ev yapımı çilek reçeli', 140.00, 80, 'kg', 4, 4, TRUE, TRUE),
('Marmelat', 'Portakal marmelatı', 130.00, 90, 'kg', 4, 3, TRUE, TRUE),
('Salça', 'Ev yapımı domates salçası', 200.00, 150, 'kg', 4, 9, TRUE, TRUE),
('Biber Salçası', 'Acısız biber salçası', 220.00, 120, 'kg', 4, 9, TRUE, TRUE),
('Zeytin', 'Gemlik siyah zeytin', 150.00, 200, 'kg', 4, 3, FALSE, TRUE),
('Yeşil Zeytin', 'Kırma yeşil zeytin', 140.00, 180, 'kg', 4, 4, TRUE, TRUE),
('Zeytin Ezmesi', 'Kahvaltılık zeytin ezmesi', 160.00, 100, 'kg', 4, 3, TRUE, TRUE),
('Menemenlik', 'Hazır menemenlik domates-biber', 45.00, 150, 'kg', 4, 3, TRUE, TRUE),
('Pastırma', 'Kayseri pastırması, dana', 550.00, 80, 'kg', 4, 5, FALSE, TRUE),

-- EKMEK & UNLU MAMÜL (71-80)
('Köy Ekmeği', 'Odun fırını köy ekmeği', 40.00, 100, 'adet', 5, 4, TRUE, TRUE),
('Ramazan Pidesi', 'Ev yapımı ramazan pidesi', 25.00, 80, 'adet', 5, 3, TRUE, TRUE),
('Bazlama', 'Taze bazlama', 15.00, 200, 'adet', 5, 4, TRUE, TRUE),
('Gözleme', 'Ispanaklı gözleme', 45.00, 120, 'adet', 5, 3, TRUE, TRUE),
('Poğaça', 'Peynirli poğaça', 20.00, 150, 'adet', 5, 4, TRUE, TRUE),
('Simit', 'Mahlepli simit', 10.00, 300, 'adet', 5, 3, FALSE, TRUE),
('Açma', 'Tereyağlı açma', 18.00, 150, 'adet', 5, 4, FALSE, TRUE),
('Mısır Ekmeği', 'Mısır unundan ekmek', 35.00, 100, 'adet', 5, 9, TRUE, TRUE),
('Yufka', 'Taze yufka, ev yapımı', 60.00, 80, 'kg', 5, 3, TRUE, TRUE),
('Lavaş', 'Tandır lavaşı', 25.00, 120, 'adet', 5, 4, TRUE, TRUE),

-- ZEYTİN & ZEYTİNYAĞI (81-90)
('Soğuk Sıkım Zeytinyağı', 'Naturel sızma zeytinyağı', 280.00, 200, 'lt', 6, 3, TRUE, TRUE),
('Erken Hasat Zeytinyağı', 'Yüksek antioksidan', 350.00, 150, 'lt', 6, 4, TRUE, TRUE),
('Organik Zeytinyağı', 'Organik sertifikalı', 320.00, 100, 'lt', 6, 9, TRUE, TRUE),
('5 Lt Teneke Zeytinyağı', 'Aile boyu ekonomik', 1200.00, 80, 'lt', 6, 3, TRUE, TRUE),
('Naturel Birincil', 'Birincil kalite zeytinyağı', 240.00, 150, 'lt', 6, 4, TRUE, TRUE),
('Riviera Zeytinyağı', 'Yemeklik riviera', 200.00, 180, 'lt', 6, 9, TRUE, TRUE),
('Zeytin Ezmesi', 'Kahvaltılık zeytin ezmesi', 180.00, 120, 'kg', 6, 3, TRUE, TRUE),
('Sızma Zeytinyağı', 'Güneydoğu Anadolu sızması', 300.00, 100, 'lt', 6, 9, TRUE, TRUE),
('Hatay Zeytinyağı', 'Hatayın meşhur zeytinyağı', 290.00, 150, 'lt', 6, 3, TRUE, TRUE),
('Ayvalık Zeytinyağı', 'Edremit Ayvalık zeytinyağı', 310.00, 200, 'lt', 6, 4, TRUE, TRUE),

-- KURU GIDA (91-100)
('Mercimek', 'Kırmızı mercimek, yerli', 45.00, 500, 'kg', 8, 9, TRUE, TRUE),
('Yeşil Mercimek', 'Yeşil mercimek', 50.00, 400, 'kg', 8, 3, TRUE, TRUE),
('Nohut', 'Yerli nohut', 55.00, 450, 'kg', 8, 4, TRUE, TRUE),
('Kuru Fasulye', 'Barbunya fasulye', 65.00, 400, 'kg', 8, 9, TRUE, TRUE),
('Börülce', 'Kara börülce', 70.00, 300, 'kg', 8, 3, TRUE, TRUE),
('Bulgur', 'Köy bulguru, pilavlık', 35.00, 600, 'kg', 8, 4, TRUE, TRUE),
('Kuskus', 'Ev yapımı kuskus', 50.00, 250, 'kg', 8, 9, TRUE, TRUE),
('Tarhana', 'Acısız ev tarhanası', 120.00, 200, 'kg', 8, 3, TRUE, TRUE),
('Erişte', 'Ev yapımı erişte', 80.00, 300, 'kg', 8, 4, TRUE, TRUE),
('Kuru Kayısı', 'Malatya kuru kayısısı, gün kurusu', 180.00, 400, 'kg', 8, 9, TRUE, TRUE);

-- ============================================
-- 5. SİPARİŞLER TABLOSU
-- ============================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    address_id BIGINT,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status ENUM('BEKLEMEDE', 'HAZIRLANIYOR', 'YOLDA', 'TESLIM_EDILDI', 'IPTAL') DEFAULT 'BEKLEMEDE',
    payment_method ENUM('CARD', 'TRANSFER', 'COD') DEFAULT 'TRANSFER',
    payment_status VARCHAR(50) DEFAULT 'BEKLEMEDE',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Siparişler (Her müşteri için 2-3 sipariş)
INSERT INTO orders (order_number, user_id, address_id, total_amount, shipping_fee, final_amount, status, payment_method, created_at) VALUES
('ORD-2024-001', 6, 1, 450.00, 30.00, 480.00, 'TESLIM_EDILDI', 'TRANSFER', '2024-03-15'),
('ORD-2024-002', 6, 1, 280.00, 30.00, 310.00, 'HAZIRLANIYOR', 'TRANSFER', '2024-03-20'),
('ORD-2024-003', 7, 3, 650.00, 30.00, 680.00, 'TESLIM_EDILDI', 'CARD', '2024-03-10'),
('ORD-2024-004', 7, 3, 180.00, 30.00, 210.00, 'YOLDA', 'COD', '2024-03-25'),
('ORD-2024-005', 8, 4, 890.00, 30.00, 920.00, 'TESLIM_EDILDI', 'TRANSFER', '2024-03-12'),
('ORD-2024-006', 8, 4, 340.00, 30.00, 370.00, 'BEKLEMEDE', 'TRANSFER', '2024-03-28'),
('ORD-2024-007', 10, 5, 1200.00, 0.00, 1200.00, 'HAZIRLANIYOR', 'CARD', '2024-03-22'),
('ORD-2024-008', 6, 1, 520.00, 30.00, 550.00, 'YOLDA', 'TRANSFER', '2024-03-18'),
('ORD-2024-009', 7, 3, 780.00, 30.00, 810.00, 'TESLIM_EDILDI', 'TRANSFER', '2024-03-05'),
('ORD-2024-010', 8, 4, 450.00, 30.00, 480.00, 'HAZIRLANIYOR', 'COD', '2024-03-30');

-- ============================================
-- 6. SİPARİŞ ÜRÜNLERİ TABLOSU
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    producer_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2),
    producer_earnings DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (producer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sipariş detayları
INSERT INTO order_items (order_id, product_id, producer_id, quantity, unit_price, total_price, commission_rate, commission_amount, producer_earnings) VALUES
-- Sipariş 001 (Fatma - Mehmet Yılmaz ürünleri)
(1, 1, 3, 2, 35.00, 70.00, 10.00, 7.00, 63.00),
(1, 2, 3, 1, 45.00, 45.00, 10.00, 4.50, 40.50),
(1, 6, 3, 3, 55.00, 165.00, 10.00, 16.50, 148.50),
(1, 41, 3, 5, 25.00, 125.00, 10.00, 12.50, 112.50),
(1, 61, 3, 1, 180.00, 180.00, 10.00, 18.00, 162.00),

-- Sipariş 002 (Fatma - Ayşe Kaya ürünleri)
(2, 3, 4, 0.5, 120.00, 60.00, 10.00, 6.00, 54.00),
(2, 4, 4, 2, 60.00, 120.00, 10.00, 12.00, 108.00),
(2, 43, 4, 1, 160.00, 160.00, 10.00, 16.00, 144.00),

-- Sipariş 003 (Ahmet - Karışık üreticiler)
(3, 10, 9, 2, 50.00, 100.00, 10.00, 10.00, 90.00),
(3, 30, 9, 1, 250.00, 250.00, 10.00, 25.00, 225.00),
(3, 71, 4, 3, 40.00, 120.00, 10.00, 12.00, 108.00),
(3, 91, 9, 3, 45.00, 135.00, 10.00, 13.50, 121.50);

-- ============================================
-- 7. İNDİRİM KODLARI SİSTEMİ
-- ============================================
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek İndirim Kodları
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, start_date, end_date, is_active, created_by) VALUES
('INDIRIM20', 'Yeni müşterilere özel %20 indirim', 'PERCENTAGE', 20.00, 100.00, 100.00, 100, 1, '2024-01-01', '2024-12-31', TRUE, 1),
('HOSGELDIN50', 'Hoş geldin 50 TL indirim', 'FIXED', 50.00, 200.00, NULL, 50, 1, '2024-01-01', '2024-12-31', TRUE, 1),
('RAMAZAN15', 'Ramazan ayına özel %15', 'PERCENTAGE', 15.00, 150.00, 75.00, NULL, 1, '2024-03-01', '2024-04-30', TRUE, 1),
('UYE10', 'Üyelere özel %10 indirim', 'PERCENTAGE', 10.00, 0, 50.00, NULL, 2, '2024-01-01', '2024-12-31', TRUE, 1),
('SEPET100', '100 TL üzeri 25 TL indirim', 'FIXED', 25.00, 100.00, NULL, 200, 1, '2024-01-01', '2024-12-31', TRUE, 1);

-- ============================================
-- 8. MESAJLAŞMA SİSTEMİ
-- ============================================
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('GENERAL', 'ORDER', 'PRODUCT', 'COMPLAINT', 'SUPPORT') DEFAULT 'GENERAL',
    related_order_id BIGINT,
    related_product_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek Mesajlar
INSERT INTO messages (sender_id, receiver_id, subject, content, message_type, related_order_id, is_read, created_at) VALUES
(6, 3, 'Sipariş Hakkında', 'Merhaba, siparişim ne zaman hazırlanır?', 'ORDER', 1, TRUE, '2024-03-15'),
(3, 6, 'Re: Sipariş Hakkında', 'Merhaba Fatma Hanım, siparişiniz yarın kargoya verilecek.', 'ORDER', 1, FALSE, '2024-03-15'),
(7, 4, 'Ürün Sorusu', 'Organik mi bu ürünler?', 'PRODUCT', NULL, TRUE, '2024-03-10'),
(1, 6, 'Hoş Geldiniz', 'ÇiftçidenKapına ailesine hoş geldiniz!', 'GENERAL', NULL, TRUE, '2024-03-01');

-- ============================================
-- 9. BİLDİRİMLER SİSTEMİ
-- ============================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    notification_type ENUM('GENERAL', 'ORDER', 'MESSAGE', 'PROMOTION', 'SYSTEM') DEFAULT 'GENERAL',
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek Bildirimler
INSERT INTO notifications (user_id, title, content, notification_type, related_entity_id, is_read) VALUES
(3, 'Yeni Sipariş', 'Yeni bir siparişiniz var #ORD-2024-001', 'ORDER', 1, TRUE),
(3, 'Sipariş Hazırlandı', 'Siparişiniz hazırlandı ve kargoya verildi', 'ORDER', 1, TRUE),
(4, 'Yeni Sipariş', 'Yeni bir siparişiniz var #ORD-2024-002', 'ORDER', 2, FALSE),
(6, 'Mesajınız Var', 'Mehmet Yılmaz size mesaj gönderdi', 'MESSAGE', 1, FALSE);

-- ============================================
-- 10. SİTE AYARLARI
-- ============================================
CREATE TABLE site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'ÇiftçidenKapına',
    site_description TEXT,
    contact_email VARCHAR(255) DEFAULT 'info@ciftcidenkapina.com',
    contact_phone VARCHAR(50) DEFAULT '0850 123 45 67',
    currency VARCHAR(10) DEFAULT 'TRY',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    shipping_fee DECIMAL(10,2) DEFAULT 30.00,
    free_shipping_threshold DECIMAL(10,2) DEFAULT 500.00,
    min_order_amount DECIMAL(10,2) DEFAULT 50.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_registration BOOLEAN DEFAULT TRUE,
    auto_approve_producers BOOLEAN DEFAULT FALSE,
    require_approval_for_products BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'tr',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_settings (id) VALUES (1);

-- ============================================
-- 11. E-POSTA ŞABLONLARI
-- ============================================
CREATE TABLE email_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL,
    content_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek E-posta Şablonları
INSERT INTO email_templates (template_key, name, subject, content_html) VALUES
('WELCOME', 'Hoş Geldiniz', 'Hoş Geldiniz - ÇiftçidenKapına', 
'<h1>Merhaba {{userName}}!</h1><p>ÇiftçidenKapına ailesine hoş geldiniz.</p>'),
('ORDER_CONFIRMATION', 'Sipariş Onayı', 'Siparişiniz Alındı - {{orderNumber}}', 
'<h1>Siparişiniz Alındı</h1><p>Sipariş numaranız: {{orderNumber}}</p>'),
('PASSWORD_RESET', 'Şifre Sıfırlama', 'Geçici Şifreniz - ÇiftçidenKapına', 
'<h1>Geçici Şifreniz</h1><p>Şifreniz: {{tempPassword}}</p>'),
('ORDER_STATUS_UPDATE', 'Sipariş Durumu', 'Sipariş Durumunuz Güncellendi', 
'<h1>Sipariş Durumu</h1><p>Yeni durum: {{status}}</p>'),
('PRODUCT_DEACTIVATED', 'Ürün Pasife Alındı', 'Ürününüz Pasife Alındı', 
'<h1>Ürün Pasife Alındı</h1><p>{{productName}} ürününüz yönetici tarafından pasife alındı.</p>');

-- ============================================
-- 12. FAVORİ ÜRÜNLER
-- ============================================
CREATE TABLE user_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_favorite (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. ÜRÜN FOTOĞRAFLARI
-- ============================================
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 14. FİNANSAL RAPORLAR
-- ============================================
CREATE TABLE financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    producer_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    order_count INT DEFAULT 0,
    details JSON,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- İNDEKSLEME & OPTİMİZASYON
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_producer ON products(producer_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_producer ON order_items(producer_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================
-- TAMAMLANDI
-- ============================================
-- Toplam: 10 kullanıcı, 100 ürün, 10 kategori, 10 sipariş
-- Tüm ilişkiler kuruldu, sistem hazır!
-- ============================================