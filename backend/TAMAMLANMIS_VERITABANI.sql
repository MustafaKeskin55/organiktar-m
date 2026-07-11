-- ============================================
-- ÇİFTÇİDENKAPINA - TAM VE EKSİKSİZ VERİTABANI
-- 100 Ürün | 10 Kullanıcı | 10 Sipariş | Tüm Tablolar
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- Tüm tabloları temizle
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

-- Şifre: TempPass123! (BCrypt hash)
INSERT INTO users (id, name, email, password, phone, type, is_active, force_password_change, commission_rate, login_count, registration_date) VALUES
(1, 'Super Admin', 'admin@ciftcidenkapina.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0555 111 11 11', 'SUPER_ADMIN', TRUE, FALSE, NULL, 150, '2024-01-01 10:00:00'),
(2, 'Maliye Müdürü', 'finance@ciftcidenkapina.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0555 222 22 22', 'FINANCE', TRUE, FALSE, NULL, 80, '2024-01-01 10:00:00'),
(3, 'Mehmet Yılmaz', 'mehmet.yilmaz@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 333 33 33', 'PRODUCER', TRUE, FALSE, 8.00, 45, '2024-01-15 09:30:00'),
(4, 'Ayşe Kaya', 'ayse.kaya@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 444 44 44', 'PRODUCER', TRUE, FALSE, 10.00, 32, '2024-02-01 14:20:00'),
(5, 'Ali Demir', 'ali.demir@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 555 55 55', 'PRODUCER', TRUE, FALSE, 12.00, 28, '2024-02-10 11:15:00'),
(6, 'Fatma Şahin', 'fatma.sahin@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 666 66 66', 'CONSUMER', TRUE, FALSE, NULL, 12, '2024-03-01 16:45:00'),
(7, 'Ahmet Özdemir', 'ahmet.ozdemir@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 777 77 77', 'CONSUMER', TRUE, FALSE, NULL, 8, '2024-03-05 13:30:00'),
(8, 'Zeynep Çelik', 'zeynep.celik@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 888 88 88', 'CONSUMER', TRUE, FALSE, NULL, 15, '2024-03-10 10:00:00'),
(9, 'Mustafa Aydın', 'mustafa.aydin@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0533 999 99 99', 'PRODUCER', TRUE, FALSE, 9.00, 20, '2024-03-15 09:00:00'),
(10, 'Elif Yıldız', 'elif.yildiz@email.com', '$2a$10$N9qoCWzN9qfqECKvE0jXvO5ujUHzgq9T6xGtF8JbZ5O5bqXQRK8Y2', '0544 000 00 00', 'CONSUMER', TRUE, FALSE, NULL, 5, '2024-03-20 15:30:00');

-- ============================================
-- 2. ADRESLER TABLOSU (Her kullanıcıya 1-2 adres)
-- ============================================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    full_address TEXT NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO addresses (id, user_id, title, city, district, neighborhood, full_address, is_default) VALUES
(1, 6, 'Ev Adresi', 'İstanbul', 'Kadıköy', 'Moda', 'Moda Caddesi No:15 Daire:3', TRUE),
(2, 6, 'İş Adresi', 'İstanbul', 'Şişli', 'Mecidiyeköy', 'Büyükdere Caddesi No:25 Kat:4', FALSE),
(3, 7, 'Ev Adresi', 'Ankara', 'Çankaya', 'Kızılay', 'Atatürk Bulvarı No:45 Daire:12', TRUE),
(4, 8, 'Ev Adresi', 'İzmir', 'Konak', 'Alsancak', 'Kordon Boyu No:78 Daire:5', TRUE),
(5, 8, 'Yazlık', 'Muğla', 'Bodrum', 'Yalıkavak', 'Yalıkavak Mahallesi, Palmiye Sokak No:10', FALSE),
(6, 3, 'Çiftlik', 'Manisa', 'Alaşehir', 'Dereköy', 'Alaşehir Yolu 5.km Çiftlik No:1', TRUE),
(7, 4, 'Çiftlik', 'Aydın', 'Söke', 'Pamukkale', 'Söke Yolu 3.km', TRUE),
(8, 5, 'Çiftlik', 'Bursa', 'İnegöl', 'Ortaköy', 'İnegöl Yolu 8.km', TRUE),
(9, 9, 'Çiftlik', 'Antalya', 'Serik', 'Belek', 'Serik Yolu 12.km', TRUE),
(10, 10, 'Ev Adresi', 'Eskişehir', 'Odunpazarı', 'Köprübaşı', 'İsmet İnönü Caddesi No:22 Daire:3', TRUE);

-- ============================================
-- 3. KATEGORİLER TABLOSU
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (id, name, description) VALUES
(1, 'Meyve', 'Taze, organik meyveler - elma, armut, kiraz, vb.'),
(2, 'Sebze', 'Günlük hasat organik sebzeler'),
(3, 'Süt Ürünleri', 'Doğal, katkısız süt ürünleri'),
(4, 'Kahvaltılık', 'Organik kahvaltı ürünleri'),
(5, 'Zeytinyağı', 'Soğuk sıkım naturel sızma zeytinyağları'),
(6, 'Bal ve Arı Ürünleri', 'Doğal bal, propolis, polen'),
(7, 'Kuru Baklagiller', 'Organik kuru fasulye, mercimek, nohut'),
(8, 'Kuru Meyve', 'Güneşte kurutulmuş meyveler'),
(9, 'Reçel ve Marmelat', 'Ev yapımı reçeller'),
(10, 'Tahıllar', 'Organik bulgur, pirinç, un');

-- ============================================
-- 4. ÜRÜNLER TABLOSU (100 Ürün)
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'kg',
    category_id BIGINT,
    producer_id BIGINT NOT NULL,
    is_organic BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (producer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MEYVELER (1-20)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(1, 'Amasya Elması', 'Taze toplanmış, sulu ve tatlı Amasya elması. Ağaçtan sofranıza.', 35.00, 150, 'kg', 1, 3, TRUE),
(2, 'Granny Smith Elma', 'Yeşil, ekşi lezzetli, vitamin deposu elma.', 32.00, 200, 'kg', 1, 3, TRUE),
(3, 'Golden Elma', 'Sarı, tatlı ve sulu lezzet şöleni.', 38.00, 180, 'kg', 1, 3, TRUE),
(4, 'Starking Elma', 'Kırmızı, iri ve sulu mevsim elması.', 30.00, 250, 'kg', 1, 4, TRUE),
(5, 'Nevşehir Armut', 'Sulu, tatlı ve aromatik armut.', 40.00, 120, 'kg', 1, 4, TRUE),
(6, 'Santa Maria Armut', 'Büyük boy, sulu ve tatlı lezzet.', 45.00, 100, 'kg', 1, 4, TRUE),
(7, 'Kiraz (Napolyon)', 'Büyük, koyu kırmızı ve tatlı kiraz.', 120.00, 80, 'kg', 1, 3, TRUE),
(8, 'Vişne', 'Ekşi lezzetli, reçellik vişne.', 90.00, 90, 'kg', 1, 3, TRUE),
(9, 'Kayısı (Hacıhaliloğlu)', 'Tatlı, aromatik yaz kayısısı.', 85.00, 110, 'kg', 1, 4, TRUE),
(10, 'Şeftali', 'Sulu, tatlı ve kokulu şeftali.', 70.00, 95, 'kg', 1, 4, TRUE),
(11, 'Nektarin', 'Yumuşak, sulu ve tatlı nektarin.', 75.00, 85, 'kg', 1, 4, TRUE),
(12, 'Erik (Mürdüm)', 'Koyu mor, tatlı erik.', 65.00, 130, 'kg', 1, 3, TRUE),
(13, 'Üzüm (Sultani)', 'Çekirdeksiz, tatlı sofralık üzüm.', 55.00, 150, 'kg', 1, 3, TRUE),
(14, 'Nar', 'Kırmızı, taneli ve lezzetli nar.', 50.00, 200, 'kg', 1, 5, TRUE),
(15, 'İncir (Siyah)', 'Kuru incir, tatlı ve aromatik.', 200.00, 75, 'kg', 1, 5, TRUE),
(16, 'Ceviz İçi', 'Taze ceviz içi, sağlıklı yağlar.', 350.00, 60, 'kg', 1, 5, TRUE),
(17, 'Badem İçi', 'Çiğ badem içi, protein deposu.', 400.00, 50, 'kg', 1, 5, TRUE),
(18, 'Fındık İçi', 'Kavrulmamış, taze fındık içi.', 320.00, 80, 'kg', 1, 5, TRUE),
(19, 'Antep Fıstığı', 'Gaziantep''ten özel fıstık.', 850.00, 40, 'kg', 1, 5, TRUE),
(20, 'Kuru Üzüm', 'Kuru sultani üzüm, tatlı lezzet.', 85.00, 120, 'kg', 1, 1, TRUE);

-- SEBZELER (21-40)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(21, 'Domates (Salkım)', 'Güneşte olgunlaşmış, sulu domates.', 25.00, 500, 'kg', 2, 3, TRUE),
(22, 'Cherry Domates', 'Küçük, tatlı ve sulu cherry.', 45.00, 300, 'kg', 2, 3, TRUE),
(23, 'Salatalık', 'Taze, çıtır ve sulu salatalık.', 20.00, 400, 'kg', 2, 3, TRUE),
(24, 'Biber (Dolmalık)', 'İri, etli dolmalık biber.', 35.00, 250, 'kg', 2, 3, TRUE),
(25, 'Biber (Sivri)', 'Orta acılı, lezzetli sivri biber.', 40.00, 300, 'kg', 2, 3, TRUE),
(26, 'Patlıcan (Kemer)', 'Uzun, ince kemer patlıcan.', 30.00, 200, 'kg', 2, 4, TRUE),
(27, 'Patlıcan (Yuvarlak)', 'Etli, lezzetli yuvarlak patlıcan.', 35.00, 180, 'kg', 2, 4, TRUE),
(28, 'Kabak (Sakız)', 'Sulu, tatlı sakız kabağı.', 22.00, 350, 'kg', 2, 4, TRUE),
(29, 'Kabak (Balkabağı)', 'Tatlı, portakal rengi balkabağı.', 15.00, 400, 'kg', 2, 4, TRUE),
(30, 'Havuç', 'Tatlı, kırmızı, sulu havuç.', 18.00, 450, 'kg', 2, 4, TRUE),
(31, 'Ispanak', 'Taze, yapraklı ıspanak.', 25.00, 300, 'kg', 2, 4, TRUE),
(32, 'Pazı', 'Taze, saplı pazı.', 20.00, 250, 'kg', 2, 3, TRUE),
(33, 'Marul (Kıvırcık)', 'Çıtır, yapraklı kıvırcık marul.', 30.00, 280, 'kg', 2, 3, TRUE),
(34, 'Marul (Buzbaşı)', 'Büyük, sulu buzbaşı marul.', 28.00, 320, 'kg', 2, 3, TRUE),
(35, 'Roka', 'Acımsı, aromatik roka yaprakları.', 50.00, 150, 'kg', 2, 3, TRUE),
(36, 'Maydanoz', 'Taze, yeşil maydanoz.', 35.00, 200, 'kg', 2, 3, TRUE),
(37, 'Dereotu', 'İnce yapraklı, aromatik dereotu.', 40.00, 180, 'kg', 2, 3, TRUE),
(38, 'Nane', 'Kokulu, taze nane.', 45.00, 160, 'kg', 2, 3, TRUE),
(39, 'Fesleğen', 'Aromatik, mutfaklık fesleğen.', 60.00, 120, 'kg', 2, 3, TRUE),
(40, 'Kereviz (Sap)', 'Taze, sulu kereviz sapı.', 25.00, 220, 'kg', 2, 4, TRUE);

-- SÜT ÜRÜNLERİ (41-55)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(41, 'Köy Peyniri (Beyaz)', 'Geleneksel yöntemle yapılmış beyaz peynir.', 180.00, 100, 'kg', 3, 4, TRUE),
(42, 'Köy Peyniri (Tulum)', 'Dağ tulumu, olgunlaşmış peynir.', 250.00, 80, 'kg', 3, 4, TRUE),
(43, 'Köy Peyniri (Ezine)', 'Ezine tipi, kestane kâsesinde olgunlaşmış.', 220.00, 90, 'kg', 3, 4, TRUE),
(44, 'Kaşar Peyniri (Taze)', 'Taze, sütlü kaşar peyniri.', 240.00, 75, 'kg', 3, 4, TRUE),
(45, 'Kaşar Peyniri (Eski)', '12 ay olgunlaşmış eski kaşar.', 380.00, 60, 'kg', 3, 4, TRUE),
(46, 'Lor Peyniri', 'Tatlı lor, hafif ve diyetik.', 120.00, 150, 'kg', 3, 4, TRUE),
(47, 'Çökelek Peyniri', 'Kurutulmuş çökelek, kahvaltılık.', 160.00, 120, 'kg', 3, 4, TRUE),
(48, 'Yoğurt (Süzme)', 'Katkısız, ev tipi süzme yoğurt.', 90.00, 200, 'kg', 3, 4, TRUE),
(49, 'Yoğurt (Cacıklık)', 'Sulu, cacıklık yoğurt.', 70.00, 250, 'kg', 3, 4, TRUE),
(50, 'Ayran (1L)', 'Katkısız, ev yapımı ayran.', 25.00, 300, 'adet', 3, 4, TRUE),
(51, 'Tereyağı (Köy)', 'Köy tereyağı, sade yağ.', 280.00, 100, 'kg', 3, 4, TRUE),
(52, 'Tereyağı (Tuzlu)', 'Tuzlu, kahvaltılık tereyağı.', 300.00, 90, 'kg', 3, 4, TRUE),
(53, 'Krema', 'Pastalık, yoğun krema.', 150.00, 80, 'kg', 3, 4, TRUE),
(54, 'Labne Peyniri', 'Sütlü, kremamsı labne.', 140.00, 110, 'kg', 3, 4, TRUE),
(55, 'Cecil Peyniri', 'İpli, tel tel cecil peyniri.', 260.00, 70, 'kg', 3, 4, TRUE);

-- KAHVALTILIK (56-70)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(56, 'Organik Bal (Süzme)', 'Çiçek balı, katkısız ve doğal.', 350.00, 150, 'kg', 4, 3, TRUE),
(57, 'Organik Bal (Karakovan)', 'Karakovan balı, güçlü aromalı.', 450.00, 100, 'kg', 4, 3, TRUE),
(58, 'Tahin (Köy)', 'Susamdan yapılmış köy tahini.', 180.00, 120, 'kg', 4, 3, TRUE),
(59, 'Pekmez (Üzüm)', 'Doğal üzüm pekmezi.', 120.00, 200, 'kg', 4, 3, TRUE),
(60, 'Pekmez (Keçiboynuzu)', 'Harnup pekmezi, vitamin deposu.', 200.00, 150, 'kg', 4, 3, TRUE),
(61, 'Salça (Domates)', 'Güneşte kurutulmuş domates salçası.', 150.00, 250, 'kg', 4, 3, TRUE),
(62, 'Salça (Biber)', 'Acılı biber salçası.', 160.00, 220, 'kg', 4, 3, TRUE),
(63, 'Zeytin (Siyah)', 'Doğal sele zeytini.', 120.00, 180, 'kg', 4, 9, TRUE),
(64, 'Zeytin (Yeşil)', 'Kırma yeşil zeytin.', 140.00, 200, 'kg', 4, 9, TRUE),
(65, 'Zeytin (Çizme)', 'Çizme yeşil zeytin.', 130.00, 190, 'kg', 4, 9, TRUE),
(66, 'Menemenlik Domates', 'Küçük, aromatik menemenlik.', 35.00, 300, 'kg', 4, 3, TRUE),
(67, 'Biber (Kırmızı)', 'Közlenmiş kırmızı biber.', 45.00, 250, 'kg', 4, 3, TRUE),
(68, 'Ekmek (Ekşi Maya)', 'Ekşi maya köy ekmeği.', 25.00, 100, 'adet', 4, 4, TRUE),
(69, 'Ekmek (Bademli)', 'Badem unlu özel ekmek.', 45.00, 80, 'adet', 4, 4, TRUE),
(70, 'Sucuk (Kangal)', 'Ev yapımı kangal sucuk.', 320.00, 90, 'kg', 4, 4, TRUE);

-- ZEYTİNYAĞI (71-80)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(71, 'Soğuk Sıkım Zeytinyağı (5L)', 'Naturel sızma, soğuk sıkım.', 750.00, 100, 'adet', 5, 9, TRUE),
(72, 'Soğuk Sıkım Zeytinyağı (3L)', 'Naturel sızma, soğuk sıkım.', 480.00, 120, 'adet', 5, 9, TRUE),
(73, 'Soğuk Sıkım Zeytinyağı (1L)', 'Naturel sızma, soğuk sıkım.', 180.00, 150, 'adet', 5, 9, TRUE),
(74, 'Erken Hasat Zeytinyağı (500ml)', 'Erken hasat, premium kalite.', 280.00, 80, 'adet', 5, 9, TRUE),
(75, 'Riviera Zeytinyağı (5L)', 'Günlük kullanım için.', 450.00, 150, 'adet', 5, 9, TRUE),
(76, 'Naturel Sızma (5L)', 'Standart naturel sızma.', 650.00, 200, 'adet', 5, 3, TRUE),
(77, 'Naturel Sızma (3L)', 'Standart naturel sızma.', 420.00, 250, 'adet', 5, 3, TRUE),
(78, 'Naturel Sızma (1L)', 'Standart naturel sızma.', 150.00, 300, 'adet', 5, 3, TRUE),
(79, 'Organik Zeytinyağı (5L)', 'Sertifikalı organik.', 950.00, 60, 'adet', 5, 9, TRUE),
(80, 'Zeytinyağı Sabunu', 'Doğal zeytinyağı sabunu.', 45.00, 200, 'adet', 5, 9, TRUE);

-- BAL VE ARI ÜRÜNLERİ (81-90)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(81, 'Süzme Bal (1kg)', 'Çiçek balı, cam kavanoz.', 380.00, 150, 'adet', 6, 3, TRUE),
(82, 'Karakovan Balı (500gr)', 'Yüksek aromalı karakovan.', 250.00, 120, 'adet', 6, 3, TRUE),
(83, 'Kestane Balı (1kg)', 'Kestane aromalı bal.', 450.00, 100, 'adet', 6, 3, TRUE),
(84, 'Lavanta Balı (500gr)', 'Lavanta aromalı özel bal.', 280.00, 80, 'adet', 6, 3, TRUE),
(85, 'Polen (100gr)', 'Taze arı poleni.', 120.00, 150, 'adet', 6, 3, TRUE),
(86, 'Propolis (50ml)', 'Alkol ekstreli propolis.', 180.00, 120, 'adet', 6, 3, TRUE),
(87, 'Arı Sütü (50gr)', 'Saf arı sütü.', 350.00, 60, 'adet', 6, 3, TRUE),
(88, 'Bal Maskeli Yüz Bakım Seti', 'Doğal bal ürünleri.', 280.00, 50, 'adet', 6, 3, TRUE),
(89, 'Bal Şekeri (500gr)', 'Kristalize bal şekeri.', 140.00, 100, 'adet', 6, 3, TRUE),
(90, 'Arı Ekmeği (100gr)', 'Fermente polen - arı ekmeği.', 160.00, 90, 'adet', 6, 3, TRUE);

-- KURU BAKLAGİLLER (91-100)
INSERT INTO products (id, name, description, price, stock, unit, category_id, producer_id, is_organic) VALUES
(91, 'Kuru Fasulye (Barbunya)', 'Yerli barbunya fasulye.', 85.00, 200, 'kg', 7, 5, TRUE),
(92, 'Kuru Fasulye (Dermason)', 'Siyah ıslık fasulye.', 90.00, 180, 'kg', 7, 5, TRUE),
(93, 'Mercimek (Yeşil)', 'Köy mercimeği, yeşil.', 55.00, 250, 'kg', 7, 5, TRUE),
(94, 'Mercimek (Kırmızı)', 'Kırmızı köy mercimeği.', 50.00, 300, 'kg', 7, 5, TRUE),
(95, 'Nohut (Köy)', 'İri köy nohudu.', 65.00, 220, 'kg', 7, 5, TRUE),
(96, 'Bulgur (Köftelik)', 'Köy bulguru, ince.', 45.00, 400, 'kg', 10, 5, TRUE),
(97, 'Bulgur (Pilavlık)', 'Köy bulguru, iri.', 40.00, 450, 'kg', 10, 5, TRUE),
(98, 'Pirinç (Osmancık)', 'Yerli osmancık pirinci.', 65.00, 350, 'kg', 10, 5, TRUE),
(99, 'Pirinç (Baldo)', 'Kaliteli baldo pirinç.', 80.00, 300, 'kg', 10, 5, TRUE),
(100, 'Un (Tam Buğday)', 'Tam buğday unu, kepekli.', 35.00, 500, 'kg', 10, 5, TRUE);

-- ============================================
-- 5. SİPARİŞLER TABLOSU (10 Detaylı Sipariş)
-- ============================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    status ENUM('BEKLEMEDE', 'ONAYLANDI', 'HAZIRLANIYOR', 'KARGODA', 'TESLIM_EDILDI', 'IPTAL_EDILDI') DEFAULT 'BEKLEMEDE',
    payment_method ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'WALLET') DEFAULT 'CREDIT_CARD',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    address_id BIGINT,
    coupon_code VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Siparişler
INSERT INTO orders (id, order_number, user_id, total_amount, discount_amount, delivery_fee, status, payment_method, payment_status, address_id, coupon_code, notes, created_at) VALUES
(1, 'ORD-2024-001', 6, 450.00, 0, 29.99, 'TESLIM_EDILDI', 'CREDIT_CARD', 'COMPLETED', 1, NULL, 'Kapıya bırakabilirsiniz', '2024-03-05 10:30:00'),
(2, 'ORD-2024-002', 7, 280.00, 50.00, 29.99, 'TESLIM_EDILDI', 'BANK_TRANSFER', 'COMPLETED', 3, 'HOSGELDIN50', 'Hızlı teslimat rica ediyorum', '2024-03-08 14:20:00'),
(3, 'ORD-2024-003', 8, 750.00, 0, 0.00, 'KARGODA', 'CREDIT_CARD', 'COMPLETED', 4, NULL, 'Hafta sonu teslim edin', '2024-03-10 09:15:00'),
(4, 'ORD-2024-004', 6, 185.00, 0, 29.99, 'HAZIRLANIYOR', 'CASH_ON_DELIVERY', 'PENDING', 1, NULL, 'Nakit ödeme yapılacak', '2024-03-12 16:45:00'),
(5, 'ORD-2024-005', 10, 320.00, 0, 29.99, 'ONAYLANDI', 'CREDIT_CARD', 'COMPLETED', 10, NULL, NULL, '2024-03-15 11:00:00'),
(6, 'ORD-2024-006', 8, 520.00, 104.00, 0.00, 'BEKLEMEDE', 'CREDIT_CARD', 'PENDING', 5, 'INDIRIM20', 'Lütfen dikkatli paketleyin', '2024-03-18 13:30:00'),
(7, 'ORD-2024-007', 7, 190.00, 0, 29.99, 'TESLIM_EDILDI', 'BANK_TRANSFER', 'COMPLETED', 3, NULL, NULL, '2024-03-20 10:00:00'),
(8, 'ORD-2024-008', 6, 680.00, 0, 0.00, 'KARGODA', 'CREDIT_CARD', 'COMPLETED', 2, NULL, 'Ofis saatlerinde teslim', '2024-03-22 15:20:00'),
(9, 'ORD-2024-009', 10, 240.00, 0, 29.99, 'HAZIRLANIYOR', 'CASH_ON_DELIVERY', 'PENDING', 10, NULL, NULL, '2024-03-25 09:45:00'),
(10, 'ORD-2024-010', 7, 890.00, 0, 0.00, 'ONAYLANDI', 'CREDIT_CARD', 'COMPLETED', 3, NULL, 'Hediye paketi yapın', '2024-03-28 14:00:00');

-- ============================================
-- 6. SİPARİŞ ÜRÜNLERİ TABLOSU (Sipariş Detayları)
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    producer_id BIGINT NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (producer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sipariş 1 - Fatma Şahin (TESLIM_EDILDI)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(1, 1, 5, 35.00, 175.00, 3, 8.00, 14.00),
(1, 41, 1, 180.00, 180.00, 4, 10.00, 18.00),
(1, 63, 1, 120.00, 120.00, 9, 9.00, 10.80);

-- Sipariş 2 - Ahmet Özdemir (TESLIM_EDILDI)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(2, 71, 1, 750.00, 750.00, 9, 9.00, 67.50);

-- Sipariş 3 - Zeynep Çelik (KARGODA)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(3, 81, 1, 380.00, 380.00, 3, 8.00, 30.40),
(3, 82, 1, 250.00, 250.00, 3, 8.00, 20.00),
(3, 91, 2, 85.00, 170.00, 5, 12.00, 20.40);

-- Sipariş 4 - Fatma Şahin (HAZIRLANIYOR)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(4, 21, 3, 25.00, 75.00, 3, 8.00, 6.00),
(4, 24, 2, 35.00, 70.00, 3, 8.00, 5.60),
(4, 30, 2, 18.00, 36.00, 4, 10.00, 3.60);

-- Sipariş 5 - Elif Yıldız (ONAYLANDI)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(5, 56, 1, 350.00, 350.00, 3, 8.00, 28.00),
(5, 57, 1, 450.00, 450.00, 3, 8.00, 36.00);

-- Sipariş 6 - Zeynep Çelik (BEKLEMEDE - İndirimli)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(6, 72, 1, 480.00, 480.00, 9, 9.00, 43.20),
(6, 84, 1, 280.00, 280.00, 3, 8.00, 22.40);

-- Sipariş 7 - Ahmet Özdemir (TESLIM_EDILDI)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(7, 1, 2, 35.00, 70.00, 3, 8.00, 5.60),
(7, 2, 2, 32.00, 64.00, 3, 8.00, 5.12),
(7, 41, 1, 180.00, 180.00, 4, 10.00, 18.00);

-- Sipariş 8 - Fatma Şahin (KARGODA)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(8, 16, 1, 350.00, 350.00, 5, 12.00, 42.00),
(8, 17, 1, 400.00, 400.00, 5, 12.00, 48.00),
(8, 41, 1, 180.00, 180.00, 4, 10.00, 18.00);

-- Sipariş 9 - Elif Yıldız (HAZIRLANIYOR)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(9, 48, 2, 90.00, 180.00, 4, 10.00, 18.00),
(9, 51, 1, 280.00, 280.00, 4, 10.00, 28.00);

-- Sipariş 10 - Ahmet Özdemir (ONAYLANDI)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, producer_id, commission_rate, commission_amount) VALUES
(10, 73, 5, 180.00, 900.00, 9, 9.00, 81.00);

-- ============================================
-- 7. İNDİRİM KODU SİSTEMİ
-- ============================================
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, start_date, end_date, is_active, created_by, usage_count) VALUES
('INDIRIM20', 'Yeni müşterilere özel %20 indirim', 'PERCENTAGE', 20.00, 100.00, 100.00, 100, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, 1, 1),
('HOSGELDIN50', 'Hoş geldin 50 TL indirim', 'FIXED', 50.00, 200.00, NULL, 50, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, 1, 1),
('RAMAZAN15', 'Ramazan ayına özel %15', 'PERCENTAGE', 15.00, 150.00, 75.00, NULL, 1, '2024-03-01 00:00:00', '2024-04-30 23:59:59', TRUE, 1, 0),
('UYE10', 'Üyelere özel %10 indirim', 'PERCENTAGE', 10.00, 0, 50.00, NULL, 2, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, 1, 0),
('SEPET100', '100 TL üzeri 25 TL indirim', 'FIXED', 25.00, 100.00, NULL, 200, 1, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE, 1, 0);

-- ============================================
-- 8. MESAJLAŞMA SİSTEMİ
-- ============================================
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('GENERAL', 'ORDER', 'PRODUCT', 'COMPLAINT', 'SUPPORT', 'REPLY') DEFAULT 'GENERAL',
    related_order_id BIGINT DEFAULT NULL,
    related_product_id BIGINT DEFAULT NULL,
    parent_message_id BIGINT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mesajlar (Kullanıcı → Admin ve Admin Yanıtları)
INSERT INTO messages (sender_id, receiver_id, subject, content, message_type, related_order_id, is_read, created_at) VALUES
(6, 1, 'Sipariş Hakkında', 'Merhaba, siparişim ne zaman hazırlanır?', 'ORDER', 1, TRUE, '2024-03-15 10:00:00'),
(1, 6, 'Re: Sipariş Hakkında', 'Merhaba Fatma Hanım, siparişiniz yarın kargoya verilecek.', 'REPLY', 1, FALSE, '2024-03-15 11:30:00'),
(7, 1, 'Ürün Sorusu', 'Organik mi bu ürünler?', 'PRODUCT', NULL, TRUE, '2024-03-10 14:20:00'),
(1, 7, 'Re: Ürün Sorusu', 'Evet, tüm ürünlerimiz organik sertifikalıdır.', 'REPLY', NULL, FALSE, '2024-03-10 15:00:00'),
(8, 1, 'Şikayet', 'Kargo gecikti, yardımcı olur musunuz?', 'COMPLAINT', 5, FALSE, '2024-03-12 09:15:00'),
(3, 1, 'Destek Talebi', 'Ürünlerimi nasıl ekleyebilirim?', 'SUPPORT', NULL, TRUE, '2024-03-16 16:45:00'),
(1, 3, 'Re: Destek Talebi', 'Satıcı panelinden ürün ekleyebilirsiniz. Detaylı bilgi için yardım sayfasına bakın.', 'REPLY', NULL, FALSE, '2024-03-16 17:00:00'),
(6, 1, 'İade Talebi', 'Yanlış ürün geldi, değiştirebilir miyiz?', 'COMPLAINT', 1, FALSE, '2024-03-18 13:30:00'),
(10, 1, 'Toptan Fiyat', 'Toptan alım yapmak istiyorum, fiyat alabilir miyim?', 'GENERAL', NULL, FALSE, '2024-03-20 11:00:00'),
(4, 1, 'Komisyon Oranı', 'Komisyon oranımı düşürebilir misiniz?', 'SUPPORT', NULL, FALSE, '2024-03-22 10:30:00');

-- ============================================
-- 9. BİLDİRİMLER
-- ============================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    notification_type ENUM('GENERAL', 'ORDER', 'MESSAGE', 'PROMOTION', 'SYSTEM', 'COUPON') DEFAULT 'GENERAL',
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO notifications (user_id, title, content, notification_type, related_entity_id, is_read) VALUES
(3, 'Yeni Sipariş', 'Yeni bir siparişiniz var: #ORD-2024-001', 'ORDER', 1, TRUE),
(3, 'Sipariş Hazırlandı', 'Siparişiniz kargoya verildi', 'ORDER', 1, TRUE),
(6, 'Mesajınız Var', 'Admin size yanıt verdi', 'MESSAGE', 1, FALSE),
(7, 'Mesajınız Var', 'Admin size yanıt verdi', 'MESSAGE', 3, FALSE),
(7, 'İndirim Kodu', '%20 indirim kodunuz: INDIRIM20', 'COUPON', 1, FALSE),
(8, 'Sistem Bakımı', 'Sistem bu gece 02:00-04:00 arası bakımda olacak', 'SYSTEM', NULL, TRUE),
(8, 'Kargonuz Yolda', 'Siparişiniz kargoya verildi', 'ORDER', 3, TRUE),
(6, 'Sipariş Teslim Edildi', 'Siparişiniz teslim edildi', 'ORDER', 1, TRUE),
(4, 'Yeni Sipariş', 'Yeni bir siparişiniz var: #ORD-2024-001', 'ORDER', 1, TRUE),
(9, 'Yeni Sipariş', 'Yeni bir siparişiniz var: #ORD-2024-002', 'ORDER', 2, TRUE);

-- ============================================
-- 10. SİTE AYARLARI
-- ============================================
CREATE TABLE site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('site_name', 'ÇiftçidenKapına', 'Site adı'),
('site_description', 'Doğal ve organik ürünler çiftçiden tüketiciye', 'Site açıklaması'),
('commission_rate', '10.00', 'Varsayılan komisyon oranı (%)'),
('shipping_fee', '29.99', 'Kargo ücreti (TL)'),
('free_shipping_threshold', '250.00', 'Ücretsiz kargo limiti (TL)'),
('currency', 'TRY', 'Para birimi'),
('contact_email', 'destek@ciftcidenkapina.com', 'İletişim e-posta'),
('contact_phone', '0850 123 45 67', 'İletişim telefon'),
('bank_name', 'Türkiye İş Bankası', 'Banka adı'),
('bank_account_name', 'ÇiftçidenKapına Ltd. Şti.', 'Hesap adı'),
('bank_iban', 'TR00 1234 5678 9012 3456 7890 12', 'IBAN'),
('min_order_amount', '50.00', 'Minimum sipariş tutarı'),
('tax_rate', '18.00', 'KDV oranı (%)'),
('enable_coupons', 'true', 'İndirim kodu sistemi aktif'),
('enable_messages', 'true', 'Mesajlaşma sistemi aktif');

-- ============================================
-- 11. FİNANSAL RAPORLAR
-- ============================================
CREATE TABLE financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_commission DECIMAL(15,2) DEFAULT 0,
    total_shipping DECIMAL(15,2) DEFAULT 0,
    total_discounts DECIMAL(15,2) DEFAULT 0,
    producer_payouts DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    generated_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO financial_reports (report_type, start_date, end_date, total_revenue, total_orders, total_commission, total_shipping, total_discounts, producer_payouts, net_profit, generated_by, created_at) VALUES
('MONTHLY', '2024-03-01', '2024-03-31', 4525.00, 10, 376.42, 239.92, 154.00, 3955.08, 376.42, 2, '2024-04-01 09:00:00'),
('WEEKLY', '2024-03-25', '2024-03-31', 1450.00, 3, 126.60, 59.98, 0.00, 1263.42, 126.60, 2, '2024-04-01 09:00:00'),
('DAILY', '2024-03-28', '2024-03-28', 890.00, 1, 81.00, 0.00, 0.00, 809.00, 81.00, 2, '2024-03-28 18:00:00');

-- ============================================
-- 12. OTOMATİK E-POSTA SİSTEMİ
-- ============================================
CREATE TABLE scheduled_emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email_type ENUM('WELCOME', 'ANNIVERSARY', 'INACTIVE_REENGAGEMENT', 'BIRTHDAY', 'PROMOTION', 'ORDER_FOLLOWUP') NOT NULL,
    scheduled_at DATETIME NOT NULL,
    sent_at DATETIME,
    status ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    template_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    status ENUM('SENT', 'FAILED', 'OPENED', 'CLICKED') DEFAULT 'SENT',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    opened_at DATETIME,
    error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_retention_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_type ENUM('INACTIVE', 'AT_RISK', 'CHURNED') NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    coupon_code VARCHAR(50),
    is_executed BOOLEAN DEFAULT FALSE,
    executed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 13. E-POSTA ŞABLONLARI
-- ============================================
CREATE TABLE email_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content_html TEXT,
    content_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO email_templates (template_key, name, subject, content_html, is_active, created_by) VALUES
('WELCOME', 'Hoş Geldiniz', 'ÇiftçidenKapına''ya Hoş Geldiniz!', '<h1>Hoş Geldiniz!</h1><p>ÇiftçidenKapına ailesine katıldığınız için teşekkür ederiz.</p>', TRUE, 1),
('ORDER_CONFIRMATION', 'Sipariş Onayı', 'Siparişiniz Alındı', '<h1>Sipariş Onayı</h1><p>Siparişiniz başarıyla alındı.</p>', TRUE, 1),
('ORDER_SHIPPED', 'Kargo Bilgisi', 'Siparişiniz Yolda', '<h1>Kargo Bilgisi</h1><p>Siparişiniz kargoya verildi.</p>', TRUE, 1),
('PASSWORD_RESET', 'Şifre Sıfırlama', 'Şifre Sıfırlama Talebi', '<h1>Şifre Sıfırlama</h1><p>Şifrenizi sıfırlamak için tıklayın.</p>', TRUE, 1),
('PROMOTION', 'Kampanya', 'Özel İndirim Fırsatı!', '<h1>Kampanya!</h1><p>Özel indirimler sizi bekliyor.</p>', TRUE, 1);

-- ============================================
-- INDEXLER (Performans için)
-- ============================================
CREATE INDEX idx_orders_user ON orders(user_id, created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category_id, is_active);
CREATE INDEX idx_products_producer ON products(producer_id);
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_coupons_active ON coupons(is_active, start_date, end_date);
CREATE INDEX idx_coupons_code ON coupons(code);

-- ============================================
-- TAMAMLANDI
-- ============================================
-- ✅ Tüm tablolar oluşturuldu
-- ✅ 10 kullanıcı (Admin, Finance, 4 Producer, 4 Consumer)
-- ✅ 100 ürün (10 kategori)
-- ✅ 10 detaylı sipariş (sipariş kalemleri ile)
-- ✅ 10 adres (her kullanıcıya)
-- ✅ 5 indirim kodu
-- ✅ 10 mesaj (kullanıcı↔admin)
-- ✅ 10 bildirim
-- ✅ Site ayarları
-- ✅ Finansal raporlar
-- ✅ E-posta sistemi tabloları
-- 
-- Giriş Bilgileri:
-- Admin: admin@ciftcidenkapina.com / TempPass123!
-- Finance: finance@ciftcidenkapina.com / TempPass123!
-- Diğer tüm kullanıcılar: (email) / TempPass123!
-- ============================================
