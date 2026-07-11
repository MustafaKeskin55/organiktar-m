-- ============================================
-- ORGANIK TARIM - GUNCEL DATABASE SCHEMA
-- Tarih: 2026-04-02
-- Aciklama: Tüm tablolar ve ilişkiler
-- ============================================

-- Veritabanını temizle (varsa)
-- DROP TABLE IF EXISTS order_items, orders, addresses, products, users, categories, site_settings, financial_reports, payment_settings;

-- ============================================
-- 1. KATEGORILER TABLOSU (YENI)
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(1000),
    icon_name VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    product_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Varsayılan kategoriler
INSERT INTO categories (slug, name, description, image_url, display_order, is_active) VALUES
('sebze', 'Sebze', 'Taze ve organik sebzeler', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', 1, TRUE),
('meyve', 'Meyve', 'Mevsim meyveleri', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 2, TRUE),
('et-urunleri', 'Et Ürünleri', 'Doğal et ürünleri', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', 3, TRUE),
('sut-urunleri', 'Süt Ürünleri', 'Taze süt ürünleri', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 4, TRUE),
('baharat', 'Baharat', 'Doğal baharatlar', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', 5, TRUE),
('bakliyat', 'Bakliyat', 'Bakliyat ürünleri', 'https://images.unsplash.com/photo-1515543909159-80a74f035e02?w=400', 6, TRUE),
('zeytinyagi', 'Zeytinyağı', 'Doğal zeytinyağı', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 7, TRUE),
('bal', 'Bal', 'Doğal bal', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 8, TRUE),
('diger', 'Diğer', 'Diğer ürünler', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 99, TRUE);

-- ============================================
-- 2. SITE AYARLARI TABLOSU (YENI)
-- ============================================
CREATE TABLE site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL DEFAULT 'Organik Tarım',
    site_description VARCHAR(500) DEFAULT 'Doğal ve organik ürünlerin buluşma noktası',
    contact_email VARCHAR(100) DEFAULT 'info@organiktarim.com',
    contact_phone VARCHAR(20) DEFAULT '0850 123 45 67',
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    min_order_amount DECIMAL(10,2) DEFAULT 50.00,
    free_shipping_threshold DECIMAL(10,2) DEFAULT 250.00,
    shipping_fee DECIMAL(10,2) DEFAULT 29.99,
    tax_rate DECIMAL(5,2) DEFAULT 20.00,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_registration BOOLEAN DEFAULT TRUE,
    require_approval_for_products BOOLEAN DEFAULT TRUE,
    auto_approve_producers BOOLEAN DEFAULT FALSE,
    currency VARCHAR(3) DEFAULT 'TRY',
    language VARCHAR(10) DEFAULT 'tr',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Varsayılan site ayarları
INSERT INTO site_settings (
    site_name, site_description, contact_email, contact_phone,
    commission_rate, min_order_amount, free_shipping_threshold,
    shipping_fee, tax_rate, maintenance_mode, allow_registration,
    require_approval_for_products, auto_approve_producers
) VALUES (
    'Organik Tarım', 'Doğal ve organik ürünlerin buluşma noktası',
    'info@organiktarim.com', '0850 123 45 67',
    5.00, 50.00, 250.00,
    29.99, 20.00, FALSE, TRUE,
    TRUE, FALSE
);

-- ============================================
-- 3. ODEME AYARLARI TABLOSU (YENI)
-- ============================================
CREATE TABLE payment_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100),
    account_holder VARCHAR(100),
    iban VARCHAR(50),
    payment_gateway VARCHAR(50) DEFAULT 'iyzico',
    merchant_id VARCHAR(100),
    api_key VARCHAR(500),
    secret_key VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    installment_commission_rates JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 4. FINANSAL RAPORLAR TABLOSU (YENI)
-- ============================================
CREATE TABLE financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL,
    report_type ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_commission DECIMAL(15,2) DEFAULT 0.00,
    net_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_shipping DECIMAL(15,2) DEFAULT 0.00,
    total_tax DECIMAL(15,2) DEFAULT 0.00,
    cancelled_orders INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    pending_orders INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_report (report_date, report_type)
);

-- ============================================
-- 5. KULLANICILAR TABLOSU
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
    bio TEXT,
    location_city VARCHAR(50),
    location_district VARCHAR(50),
    location_address TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    favorites JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Demo kullanıcılar
INSERT INTO users (name, email, password, phone, type, is_verified, is_active) VALUES
-- Admin
('Admin Kullanıcı', 'admin@organiktarim.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad52L3f', '0555 123 4567', 'SUPER_ADMIN', TRUE, TRUE),
-- Satıcılar (Producers)
('Ali Çiftçi', 'ali.ciftci@email.com', 'mustafa2', '0555 111 2222', 'PRODUCER', TRUE, TRUE),
('Ayşe Üretici', 'ayse.uretici@email.com', 'mustafa2', '0555 222 3333', 'PRODUCER', TRUE, TRUE),
('Mehmet Tarım', 'mehmet.tarim@email.com', 'mustafa2', '0555 333 4444', 'PRODUCER', TRUE, TRUE),
-- Müşteriler (Consumers)
('Zeynep Yılmaz', 'zeynep.yilmaz@email.com', 'mustafa2', '0555 444 5555', 'CONSUMER', TRUE, TRUE),
('Ahmet Demir', 'ahmet.demir@email.com', 'mustafa2', '0555 555 6666', 'CONSUMER', TRUE, TRUE);

-- ============================================
-- 6. ADRESLER TABLOSU
-- ============================================
CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(100),
    full_address TEXT NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Demo adresler
INSERT INTO addresses (user_id, title, city, district, neighborhood, full_address, is_default) VALUES
(4, 'Ev', 'İstanbul', 'Kadıköy', 'Moda', 'Moda Caddesi No:123 Daire:5', TRUE),
(4, 'İş', 'İstanbul', 'Şişli', 'Mecidiyeköy', 'Büyükdere Caddesi No:45', FALSE),
(5, 'Ev', 'Ankara', 'Çankaya', 'Kızılay', 'Atatürk Bulvarı No:67', TRUE);

-- ============================================
-- 7. URUNLER TABLOSU
-- ============================================
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('SEBZE', 'MEYVE', 'ET', 'SUT', 'BAHARAT', 'BAKLIYAT', 'DIGER') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    is_organic BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    harvest_date DATE,
    producer_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ürün görselleri için ayrı tablo
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Demo ürünler
INSERT INTO products (name, description, category, price, unit, stock, is_organic, is_seasonal, is_active, producer_id) VALUES
('Domates', 'Yerli, sulu ve lezzetli domatesler', 'SEBZE', 25.00, 'kg', 100, TRUE, TRUE, TRUE, 2),
('Salatalık', 'Taze salatalıklar', 'SEBZE', 15.00, 'kg', 80, TRUE, TRUE, TRUE, 2),
('Elma', 'Kırmızı, tatlı elmalar', 'MEYVE', 20.00, 'kg', 150, TRUE, FALSE, TRUE, 3),
('Portakal', 'Sulu portakallar', 'MEYVE', 30.00, 'kg', 120, FALSE, TRUE, TRUE, 3),
('Süt', 'Taze inek sütü', 'SUT', 25.00, 'litre', 50, TRUE, FALSE, TRUE, 4),
('Yumurta', 'Köy yumurtası', 'SUT', 5.00, 'adet', 200, TRUE, FALSE, TRUE, 4),
('Köy Peyniri', 'Taze köy peyniri', 'SUT', 150.00, 'kg', 30, TRUE, FALSE, TRUE, 4),
('Dana Eti', 'Taze dana kıyması', 'ET', 350.00, 'kg', 40, FALSE, FALSE, TRUE, 2),
('Tavuk', 'Köy tavuğu', 'ET', 120.00, 'kg', 60, TRUE, FALSE, TRUE, 3),
('Bal', 'Çiçek balı', 'DIGER', 200.00, 'kg', 25, TRUE, FALSE, TRUE, 4);

-- Demo ürün görselleri
INSERT INTO product_images (product_id, image_url, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', 1),
(2, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400', 1),
(3, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 1),
(4, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5a?w=400', 1),
(5, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', 1),
(6, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 1),
(7, 'https://images.unsplash.com/photo-1486297677512-8e5c0f8141c7?w=400', 1),
(8, 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400', 1),
(9, 'https://images.unsplash.com/photo-1587593810167-a84920ea078c?w=400', 1),
(10, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', 1);

-- ============================================
-- 8. SIPARISLER TABLOSU
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
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    notes TEXT,
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
);

-- Sipariş numarası için trigger
DELIMITER //
CREATE TRIGGER before_insert_orders
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL THEN
        SET NEW.order_number = CONCAT('ORD-', UNIX_TIMESTAMP(), '-', FLOOR(RAND() * 1000));
    END IF;
    IF NEW.estimated_delivery IS NULL THEN
        SET NEW.estimated_delivery = DATE_ADD(CURDATE(), INTERVAL 3 DAY);
    END IF;
END//
DELIMITER ;

-- ============================================
-- 9. SIPARIS KALEMLERI TABLOSU
-- ============================================
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Demo siparişler
INSERT INTO orders (user_id, address_id, total_amount, delivery_fee, status, payment_method, payment_status, estimated_delivery) VALUES
(4, 1, 150.00, 29.99, 'TESLIM_EDILDI', 'CARD', 'COMPLETED', DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
(4, 1, 250.00, 0.00, 'TESLIM_EDILDI', 'TRANSFER', 'COMPLETED', DATE_ADD(CURDATE(), INTERVAL -5 DAY)),
(5, 3, 75.00, 29.99, 'YOLDA', 'COD', 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
(4, 2, 500.00, 0.00, 'HAZIRLANIYOR', 'CARD', 'COMPLETED', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
(5, 3, 45.00, 29.99, 'BEKLEMEDE', 'TRANSFER', 'PENDING', DATE_ADD(CURDATE(), INTERVAL 3 DAY));

-- Demo sipariş kalemleri
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Sipariş 1: Domates + Elma
(1, 1, 3, 25.00),
(1, 3, 2, 20.00),
(1, 5, 2, 25.00),
-- Sipariş 2: Peynir + Bal
(2, 7, 1, 150.00),
(2, 10, 2, 200.00),
-- Sipariş 3: Yumurta
(3, 6, 15, 5.00),
-- Sipariş 4: Dana Eti + Tavuk
(4, 8, 1, 350.00),
(4, 9, 2, 120.00),
-- Sipariş 5: Portakal
(5, 4, 3, 30.00);

-- ============================================
-- INDEKSLER
-- ============================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_producer ON products(producer_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);

-- ============================================
-- GORUNUMLER (VIEWS)
-- ============================================

-- Üretici bazlı sipariş gorunumu
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

-- Gunluk satis ozeti gorunumu
CREATE VIEW daily_sales_summary AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    SUM(o.delivery_fee) as total_shipping,
    COUNT(DISTINCT CASE WHEN o.status = 'TESLIM_EDILDI' THEN o.id END) as completed_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'IPTAL_EDILDI' THEN o.id END) as cancelled_orders
FROM orders o
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- ============================================
-- VERITABANI BILGISI
-- ============================================
SELECT 'Database Schema Created Successfully' as status;
SELECT CONCAT('Tables: ', COUNT(*)) as table_count FROM information_schema.tables WHERE table_schema = DATABASE();
