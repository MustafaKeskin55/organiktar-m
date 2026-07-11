-- ============================================
-- ORGANIK TARIM - CLEAN DATABASE SCHEMA
-- Tarih: 2026-04-02
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS financial_reports;
DROP TABLE IF EXISTS payment_settings;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS users;

DROP VIEW IF EXISTS producer_orders_view;
DROP VIEW IF EXISTS daily_sales_summary;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. KATEGORILER
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(1000),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    product_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categories (slug, name, description, image_url, display_order) VALUES
('sebze', 'Sebze', 'Taze ve organik sebzeler', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', 1),
('meyve', 'Meyve', 'Mevsim meyveleri', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 2),
('et-urunleri', 'Et Urunleri', 'Dogal et urunleri', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', 3),
('sut-urunleri', 'Sut Urunleri', 'Taze sut urunleri', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 4),
('baharat', 'Baharat', 'Dogal baharatlar', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 5),
('bakliyat', 'Bakliyat', 'Bakliyat urunleri', 'https://images.unsplash.com/photo-1515543909159-80a74f035e02?w=400', 6),
('zeytinyagi', 'Zeytinyagi', 'Dogal zeytinyagi', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 7),
('bal', 'Bal', 'Dogal bal', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 8),
('diger', 'Diger', 'Diger urunler', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 99);

-- ============================================
-- 2. SITE AYARLARI
-- ============================================
CREATE TABLE site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) DEFAULT 'Organik Tarim',
    site_description VARCHAR(500) DEFAULT 'Dogal ve organik urunlerin bulusma noktasi',
    contact_email VARCHAR(100) DEFAULT 'info@organiktarim.com',
    contact_phone VARCHAR(20) DEFAULT '0850 123 45 67',
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    min_order_amount DECIMAL(10,2) DEFAULT 50.00,
    free_shipping_threshold DECIMAL(10,2) DEFAULT 250.00,
    shipping_fee DECIMAL(10,2) DEFAULT 29.99,
    tax_rate DECIMAL(5,2) DEFAULT 20.00,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_registration BOOLEAN DEFAULT TRUE,
    currency VARCHAR(3) DEFAULT 'TRY',
    language VARCHAR(10) DEFAULT 'tr',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (site_name, commission_rate, shipping_fee) VALUES
('Organik Tarim', 5.00, 29.99);

-- ============================================
-- 3. ODEME AYARLARI
-- ============================================
CREATE TABLE payment_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100),
    account_holder VARCHAR(100),
    iban VARCHAR(50),
    payment_gateway VARCHAR(50) DEFAULT 'iyzico',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. FINANSAL RAPORLAR
-- ============================================
CREATE TABLE financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL,
    report_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_commission DECIMAL(15,2) DEFAULT 0.00,
    net_revenue DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_report (report_date, report_type)
);

-- ============================================
-- 5. KULLANICILAR
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    type ENUM('CONSUMER', 'PRODUCER', 'SUPER_ADMIN', 'MANAGER', 'FINANCE') DEFAULT 'CONSUMER',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(500),
    favorites JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, phone, type, is_verified, is_active) VALUES
('Admin Kullanici', 'admin@organiktarim.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52L3f', '0555 123 4567', 'SUPER_ADMIN', TRUE, TRUE),
('Ali Ciftci', 'ali.ciftci@email.com', 'mustafa2', '0555 111 2222', 'PRODUCER', TRUE, TRUE),
('Ayse Uretici', 'ayse.uretici@email.com', 'mustafa2', '0555 222 3333', 'PRODUCER', TRUE, TRUE),
('Mehmet Tarim', 'mehmet.tarim@email.com', 'mustafa2', '0555 333 4444', 'PRODUCER', TRUE, TRUE),
('Zeynep Yilmaz', 'zeynep.yilmaz@email.com', 'mustafa2', '0555 444 5555', 'CONSUMER', TRUE, TRUE),
('Ahmet Demir', 'ahmet.demir@email.com', 'mustafa2', '0555 555 6666', 'CONSUMER', TRUE, TRUE);

-- ============================================
-- 6. ADRESLER
-- ============================================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(100),
    full_address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO addresses (user_id, title, city, district, neighborhood, full_address, is_default) VALUES
(4, 'Ev', 'Istanbul', 'Kadikoy', 'Moda', 'Moda Caddesi No:123', TRUE),
(4, 'Is', 'Istanbul', 'Sisli', 'Mecidiyekoy', 'Buyukdere Caddesi No:45', FALSE),
(5, 'Ev', 'Ankara', 'Cankaya', 'Kizilay', 'Ataturk Bulvari No:67', TRUE);

-- ============================================
-- 7. URUNLER
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('SEBZE', 'MEYVE', 'ET', 'SUT', 'BAHARAT', 'BAKLIYAT', 'DIGER') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    is_organic BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    producer_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO products (name, description, category, price, unit, stock, is_organic, is_active, producer_id) VALUES
('Domates', 'Yerli domates', 'SEBZE', 25.00, 'kg', 100, TRUE, TRUE, 2),
('Salatalik', 'Taze salatalik', 'SEBZE', 15.00, 'kg', 80, TRUE, TRUE, 2),
('Elma', 'Kirmizi elma', 'MEYVE', 20.00, 'kg', 150, TRUE, TRUE, 3),
('Portakal', 'Sulu portakal', 'MEYVE', 30.00, 'kg', 120, FALSE, TRUE, 3),
('Sut', 'Taze sut', 'SUT', 25.00, 'litre', 50, TRUE, TRUE, 4),
('Yumurta', 'Koy yumurtasi', 'SUT', 5.00, 'adet', 200, TRUE, TRUE, 4),
('Koy Peyniri', 'Taze peynir', 'SUT', 150.00, 'kg', 30, TRUE, TRUE, 4),
('Dana Eti', 'Taze et', 'ET', 350.00, 'kg', 40, FALSE, TRUE, 2),
('Tavuk', 'Koy tavugu', 'ET', 120.00, 'kg', 60, TRUE, TRUE, 3),
('Bal', 'Cicek bali', 'DIGER', 200.00, 'kg', 25, TRUE, TRUE, 4);

INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'),
(2, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400'),
(3, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'),
(4, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5a?w=400'),
(5, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'),
(6, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
(7, 'https://images.unsplash.com/photo-1486297677512-8e5c0f8141c7?w=400'),
(8, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400'),
(9, 'https://images.unsplash.com/photo-1587593810167-a84920ea078c?w=400'),
(10, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400');

-- ============================================
-- 8. SIPARISLER
-- ============================================
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    user_id BIGINT NOT NULL,
    address_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('BEKLEMEDE', 'ONAYLANDI', 'HAZIRLANIYOR', 'YOLDA', 'TESLIM_EDILDI', 'IPTAL_EDILDI') DEFAULT 'BEKLEMEDE',
    payment_method ENUM('CARD', 'TRANSFER', 'COD') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
);

-- ============================================
-- 9. SIPARIS KALEMLERI
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Demo siparisler
INSERT INTO orders (order_number, user_id, address_id, total_amount, delivery_fee, status, payment_method) VALUES
('ORD-001-2026', 4, 1, 150.00, 29.99, 'TESLIM_EDILDI', 'CARD'),
('ORD-002-2026', 4, 1, 250.00, 0.00, 'TESLIM_EDILDI', 'TRANSFER'),
('ORD-003-2026', 5, 3, 75.00, 29.99, 'YOLDA', 'COD'),
('ORD-004-2026', 4, 2, 500.00, 0.00, 'HAZIRLANIYOR', 'CARD'),
('ORD-005-2026', 5, 3, 45.00, 29.99, 'BEKLEMEDE', 'TRANSFER');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 3, 25.00),
(1, 3, 2, 20.00),
(1, 5, 2, 25.00),
(2, 7, 1, 150.00),
(2, 10, 2, 200.00),
(3, 6, 15, 5.00),
(4, 8, 1, 350.00),
(4, 9, 2, 120.00),
(5, 4, 3, 30.00);

-- ============================================
-- INDEKSLER
-- ============================================
ALTER TABLE products ADD INDEX idx_category (category);
ALTER TABLE products ADD INDEX idx_producer (producer_id);
ALTER TABLE orders ADD INDEX idx_user (user_id);
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE addresses ADD INDEX idx_user_id (user_id);
ALTER TABLE users ADD INDEX idx_email (email);

-- ============================================
-- GORUNUMLER
-- ============================================
CREATE VIEW producer_orders_view AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at,
    u.name as customer_name,
    p.id as product_id,
    p.name as product_name,
    p.producer_id,
    pr.name as producer_name,
    oi.quantity,
    oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN users u ON o.user_id = u.id
JOIN users pr ON p.producer_id = pr.id;

-- ============================================
-- SONUC
-- ============================================
SELECT 'Database OK' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = DATABASE();
