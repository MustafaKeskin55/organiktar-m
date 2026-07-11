-- ============================================
-- ORGANİK TARIM - TAM VERİTABANI DOSYASI
-- Tek dosya: Tablolar + Veriler
-- ============================================

-- ============================================
-- 1. TÜM TABLOLARI SIFIRLA (Bağımlı olanlar önce)
-- ============================================
-- En bağımlı tablolar (önce silinmeli)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS coupon_usage_logs;
DROP TABLE IF EXISTS coupon_users;
DROP TABLE IF EXISTS coupon_products;
DROP TABLE IF EXISTS coupon_categories;
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS scheduled_emails;
DROP TABLE IF EXISTS user_retention_plans;
DROP TABLE IF EXISTS producer_earnings;
DROP TABLE IF EXISTS admin_broadcast_recipients;
DROP TABLE IF EXISTS admin_broadcasts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS site_contents;
DROP TABLE IF EXISTS email_templates;
DROP TABLE IF EXISTS payment_settings;
DROP TABLE IF EXISTS financial_reports;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS users;

-- ============================================
-- 2. TABLO YAPILARI (Schema)
-- ============================================

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    force_password_change BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2),
    last_login_date TIMESTAMP,
    login_count INT DEFAULT 0,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock INT DEFAULT 0,
    images TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_organic BOOLEAN DEFAULT FALSE,
    is_seasonal BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    harvest_date DATE,
    producer_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id)
);

CREATE TABLE product_images (
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    full_address TEXT NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'BEKLEMEDE',
    address_id BIGINT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'BEKLIYOR',
    notes TEXT,
    estimated_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL,
    report_type VARCHAR(20) NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    total_shipping DECIMAL(12,2) DEFAULT 0,
    total_tax DECIMAL(12,2) DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    cancelled_amount DECIMAL(12,2) DEFAULT 0,
    refunded_amount DECIMAL(12,2) DEFAULT 0,
    new_users INT DEFAULT 0,
    new_producers INT DEFAULT 0,
    new_products INT DEFAULT 0,
    top_selling_category VARCHAR(50),
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    shipping_fee DECIMAL(10,2) DEFAULT 29.99,
    free_shipping_threshold DECIMAL(10,2) DEFAULT 250.00,
    bank_name VARCHAR(100),
    account_holder VARCHAR(100),
    iban VARCHAR(50),
    site_title VARCHAR(100),
    site_description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100),
    account_holder VARCHAR(100),
    iban VARCHAR(50),
    account_number VARCHAR(50),
    branch_code VARCHAR(50),
    payment_gateway VARCHAR(20) DEFAULT 'NONE',
    merchant_id VARCHAR(100),
    merchant_key VARCHAR(200),
    merchant_salt VARCHAR(200),
    api_key VARCHAR(200),
    secret_key VARCHAR(200),
    is_test_mode BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT FALSE,
    allow_installments BOOLEAN DEFAULT FALSE,
    max_installment_count INT DEFAULT 6,
    min_installment_amount DOUBLE DEFAULT 100.0,
    installment_commission_rates TEXT,
    supported_cards VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE site_contents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(50) NOT NULL UNIQUE,
    content_type VARCHAR(50) NOT NULL,
    content_data TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL,
    content_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    notification_type VARCHAR(50) DEFAULT 'GENERAL',
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admin_broadcasts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    broadcast_type VARCHAR(50) DEFAULT 'ALL',
    target_filter TEXT,
    sent_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE TABLE admin_broadcast_recipients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    broadcast_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (broadcast_id) REFERENCES admin_broadcasts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    per_user_limit INT DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE coupon_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE coupon_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE coupon_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    usage_count INT DEFAULT 0,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE coupon_usage_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT,
    receiver_id BIGINT,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (parent_message_id) REFERENCES messages(id)
);

CREATE TABLE message_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE TABLE email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    template VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scheduled_emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE unique_favorite (user_id, product_id)
);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    order_id BIGINT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE user_retention_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    discount_code VARCHAR(50),
    discount_percentage DECIMAL(5,2),
    ai_generated_plan TEXT,
    suggested_actions TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE producer_earnings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producer_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    net_earning DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producer_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- 3. ÖRNEK VERİLER
-- ============================================

-- Kullanıcılar (Şifre: 123456)
INSERT INTO users (id, name, email, password, phone, type, is_active, commission_rate, login_count, created_at) VALUES
(1, 'Super Admin', 'admin@organiktarm.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0555 111 11 11', 'SUPER_ADMIN', TRUE, NULL, 150, '2024-01-01 10:00:00'),
(2, 'Nehire Mudur', 'finance@organiktarm.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0555 222 22 22', 'FINANCE', TRUE, NULL, 85, '2024-01-02 09:00:00'),
(3, 'Mehmet Yılmaz', 'mehmet.yilmaz@gmail.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0533 333 33 33', 'PRODUCER', TRUE, 8.00, 45, '2024-01-05 14:30:00'),
(4, 'Ayşe Kaya', 'ayse.kaya@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0532 444 44 44', 'PRODUCER', TRUE, 5.00, 32, '2024-01-10 11:00:00'),
(5, 'Ali Demir', 'ali.demir@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0533 555 55 55', 'PRODUCER', TRUE, 12.00, 28, '2024-01-15 16:00:00'),
(6, 'Fatma Şahin', 'fatma.sahin@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0544 666 66 66', 'CONSUMER', TRUE, NULL, 12, '2024-02-01 10:00:00'),
(7, 'Ahmet Özdemir', 'ahmet.ozdemir@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0541 777 77 77', 'CONSUMER', TRUE, NULL, 8, '2024-02-10 13:00:00'),
(8, 'Zeynep Çelik', 'zeynep.celik@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0505 888 88 88', 'CONSUMER', TRUE, NULL, 15, '2024-02-15 09:30:00'),
(9, 'Mustafa Aydın', 'mustafa.aydin@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0533 999 99 99', 'PRODUCER', TRUE, 6.00, 20, '2024-02-20 11:00:00'),
(10, 'Elif Yıldız', 'elif.yildiz@email.com', '$2a$10$N9qo8uLOckgxzZGaZY6aF.RN9qO8g9Q8E.KiFJyKx8B5Gm7e0qF0C', '0544 000 00 00', 'CONSUMER', TRUE, NULL, 5, '2024-03-01 14:00:00');

-- Kategoriler
INSERT INTO categories (id, name, description, icon, display_order, is_active) VALUES
(1, 'Sebze', 'Taze sebzeler', 'leaf', 1, TRUE),
(2, 'Meyve', 'Mevsim meyveleri', 'apple', 2, TRUE),
(3, 'Süt Ürünleri', 'Doğal süt ürünleri', 'milk', 3, TRUE),
(4, 'Et Ürünleri', 'Organik et ürünleri', 'beef', 4, TRUE),
(5, 'Bakliyat', 'Kuru bakliyat', 'wheat', 5, TRUE),
(6, 'Bal ve Reçel', 'Doğal bal ve ev yapımı reçeller', 'honey', 6, TRUE);

-- Ürünler
INSERT INTO products (id, name, description, category, price, unit, stock, images, rating, review_count, is_organic, is_active, producer_id, created_at) VALUES
(1, 'Domates', 'Doğal, ilaçsız yetiştirilmiş domates', 'sebze', 15.00, 'kg', 100, '["https://example.com/domates.jpg"]', 4.5, 12, TRUE, TRUE, 3, '2024-02-01 10:00:00'),
(2, 'Salatalık', 'Serada yetiştirilen taze salatalık', 'sebze', 12.00, 'kg', 80, '["https://example.com/salatalik.jpg"]', 4.3, 8, TRUE, TRUE, 3, '2024-02-01 11:00:00'),
(3, 'Biber', 'Kırmızı ve yeşil biber', 'sebze', 18.00, 'kg', 60, '["https://example.com/biber.jpg"]', 4.2, 6, TRUE, TRUE, 4, '2024-02-05 09:00:00'),
(4, 'Elma', 'Amasya elması', 'meyve', 20.00, 'kg', 150, '["https://example.com/elma.jpg"]', 4.7, 20, TRUE, TRUE, 3, '2024-02-10 10:00:00'),
(5, 'Portakal', 'Finike portakalı', 'meyve', 25.00, 'kg', 120, '["https://example.com/portakal.jpg"]', 4.6, 15, TRUE, TRUE, 4, '2024-02-10 11:00:00'),
(6, 'Muz', 'Yerli muz', 'meyve', 30.00, 'kg', 90, '["https://example.com/muz.jpg"]', 4.4, 10, FALSE, TRUE, 5, '2024-02-15 14:00:00'),
(7, 'Süt', 'Günlük taze inek sütü', 'sut-urunleri', 12.00, 'litre', 50, '["https://example.com/sut.jpg"]', 4.8, 25, TRUE, TRUE, 5, '2024-02-20 08:00:00'),
(8, 'Yoğurt', 'Ev yapımı yoğurt', 'sut-urunleri', 15.00, 'kg', 40, '["https://example.com/yogurt.jpg"]', 4.7, 18, TRUE, TRUE, 5, '2024-02-20 09:00:00'),
(9, 'Peynir', 'Taze beyaz peynir', 'sut-urunleri', 45.00, 'kg', 30, '["https://example.com/peynir.jpg"]', 4.9, 30, TRUE, TRUE, 9, '2024-02-25 10:00:00'),
(10, 'Yumurta', 'Köy yumurtası 30lu', 'diger', 35.00, 'adet', 200, '["https://example.com/yumurta.jpg"]', 4.6, 22, TRUE, TRUE, 9, '2024-03-01 09:00:00');

-- Adresler
INSERT INTO addresses (id, user_id, title, city, district, neighborhood, full_address, postal_code, is_default, created_at) VALUES
(1, 6, 'Ev', 'İstanbul', 'Kadıköy', 'Moda', 'Moda Cad. No:123 D:5', '34710', TRUE, '2024-02-01 10:00:00'),
(2, 7, 'Ev', 'Ankara', 'Çankaya', 'Kızılay', 'Kızılay Meydanı No:45', '06420', TRUE, '2024-02-10 13:00:00'),
(3, 8, 'İş', 'İzmir', 'Konak', 'Alsancak', 'Atatürk Cad. No:78', '35220', TRUE, '2024-02-15 09:30:00'),
(4, 10, 'Ev', 'Bursa', 'Nilüfer', 'Özlüce', 'Özlüce Mah. Çiçek Sok. No:12', '16110', TRUE, '2024-03-01 14:00:00');

-- Siparişler
INSERT INTO orders (id, order_number, user_id, total_amount, delivery_fee, status, address_id, payment_method, payment_status, created_at, updated_at) VALUES
(1, 'ORD-2024-001', 6, 127.00, 29.99, 'TESLIM_EDILDI', 1, 'CREDIT_CARD', 'ODENDI', '2024-03-01 10:00:00', '2024-03-03 14:00:00'),
(2, 'ORD-2024-002', 7, 85.00, 29.99, 'TESLIM_EDILDI', 2, 'BANK_TRANSFER', 'ODENDI', '2024-03-05 11:30:00', '2024-03-07 16:00:00'),
(3, 'ORD-2024-003', 8, 156.00, 29.99, 'HAZIRLANIYOR', 3, 'CREDIT_CARD', 'ODENDI', '2024-03-08 09:00:00', '2024-03-08 10:00:00'),
(4, 'ORD-2024-004', 6, 67.00, 29.99, 'YOLDA', 1, 'CASH_ON_DELIVERY', 'BEKLIYOR', '2024-03-10 14:00:00', '2024-03-11 09:00:00'),
(5, 'ORD-2024-005', 10, 245.00, 0.00, 'BEKLEMEDE', 4, 'CREDIT_CARD', 'BEKLIYOR', '2024-03-12 16:00:00', '2024-03-12 16:00:00'),
(6, 'ORD-2024-006', 7, 92.00, 29.99, 'ONAYLANDI', 2, 'ONLINE_PAYMENT', 'ODENDI', '2024-03-15 10:30:00', '2024-03-15 11:00:00'),
(7, 'ORD-2024-007', 8, 178.00, 29.99, 'TESLIM_EDILDI', 3, 'CREDIT_CARD', 'ODENDI', '2024-03-18 13:00:00', '2024-03-20 15:00:00'),
(8, 'ORD-2024-008', 6, 134.00, 29.99, 'YOLDA', 1, 'BANK_TRANSFER', 'ODENDI', '2024-03-20 09:00:00', '2024-03-21 10:00:00'),
(9, 'ORD-2024-009', 10, 89.00, 29.99, 'HAZIRLANIYOR', 4, 'CASH_ON_DELIVERY', 'BEKLIYOR', '2024-03-22 11:00:00', '2024-03-22 11:30:00'),
(10, 'ORD-2024-010', 7, 201.00, 29.99, 'BEKLEMEDE', 2, 'CREDIT_CARD', 'BEKLIYOR', '2024-03-25 14:30:00', '2024-03-25 14:30:00');

-- Sipariş Ürünleri
INSERT INTO order_items (id, order_id, product_id, quantity, price, total) VALUES
(1, 1, 1, 3, 15.00, 45.00),
(2, 1, 4, 2, 20.00, 40.00),
(3, 1, 7, 1, 12.00, 12.00),
(4, 2, 2, 2, 12.00, 24.00),
(5, 2, 5, 1, 25.00, 25.00),
(6, 3, 9, 2, 45.00, 90.00),
(7, 3, 10, 1, 35.00, 35.00),
(8, 4, 3, 2, 18.00, 36.00),
(9, 4, 6, 1, 30.00, 30.00),
(10, 5, 4, 5, 20.00, 100.00),
(11, 5, 5, 3, 25.00, 75.00),
(12, 6, 8, 2, 15.00, 30.00),
(13, 6, 1, 2, 15.00, 30.00),
(14, 7, 9, 3, 45.00, 135.00),
(15, 7, 2, 1, 12.00, 12.00),
(16, 8, 5, 4, 25.00, 100.00),
(17, 8, 10, 1, 35.00, 35.00),
(18, 9, 7, 3, 12.00, 36.00),
(19, 9, 3, 1, 18.00, 18.00),
(20, 10, 9, 4, 45.00, 180.00);

-- Finansal Raporlar
INSERT INTO financial_reports (id, report_date, report_type, total_orders, total_revenue, total_commission, net_revenue, total_shipping, new_users, new_producers, new_products, avg_order_value, created_at) VALUES
(1, '2024-03-01', 'DAILY', 1, 127.00, 6.35, 120.65, 29.99, 0, 0, 0, 127.00, '2024-03-01 23:59:59'),
(2, '2024-03-05', 'DAILY', 1, 85.00, 4.25, 80.75, 29.99, 0, 0, 0, 85.00, '2024-03-05 23:59:59'),
(3, '2024-03-08', 'DAILY', 1, 156.00, 7.80, 148.20, 29.99, 0, 0, 0, 156.00, '2024-03-08 23:59:59'),
(4, '2024-03-10', 'DAILY', 1, 67.00, 3.35, 63.65, 29.99, 0, 0, 0, 67.00, '2024-03-10 23:59:59'),
(5, '2024-03-12', 'DAILY', 1, 245.00, 12.25, 232.75, 0.00, 1, 0, 0, 245.00, '2024-03-12 23:59:59'),
(6, '2024-03-15', 'DAILY', 1, 92.00, 4.60, 87.40, 29.99, 0, 0, 0, 92.00, '2024-03-15 23:59:59'),
(7, '2024-03-18', 'DAILY', 1, 178.00, 8.90, 169.10, 29.99, 0, 0, 0, 178.00, '2024-03-18 23:59:59'),
(8, '2024-03-20', 'DAILY', 1, 134.00, 6.70, 127.30, 29.99, 0, 0, 0, 134.00, '2024-03-20 23:59:59'),
(9, '2024-03-22', 'DAILY', 1, 89.00, 4.45, 84.55, 29.99, 0, 0, 0, 89.00, '2024-03-22 23:59:59'),
(10, '2024-03-25', 'DAILY', 1, 201.00, 10.05, 190.95, 29.99, 0, 0, 0, 201.00, '2024-03-25 23:59:59'),
(11, '2024-03-31', 'MONTHLY', 10, 1374.00, 68.70, 1305.30, 239.91, 1, 0, 1, 137.40, '2024-03-31 23:59:59');

-- Site Ayarları
INSERT INTO site_settings (id, commission_rate, shipping_fee, free_shipping_threshold, bank_name, account_holder, iban, site_title, site_description, contact_email, contact_phone, updated_at) VALUES
(1, 5.00, 29.99, 250.00, 'Türkiye İş Bankası', 'ÇiftçidenKapına Ltd. Şti.', 'TR00 0006 4000 0011 2345 6789 01', 'ÇiftçidenKapına', 'Yerel üreticilerden doğrudan kapınıza taze ürünler', 'info@ciftcidenkapina.com', '0850 123 45 67', '2024-03-25 10:00:00');

-- Kuponlar
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, start_date, end_date, is_active, created_by, created_at) VALUES
(1, 'HOSEGELDIN', 'İlk alışverişe özel %10 indirim', 'PERCENTAGE', 10.00, 100.00, 50.00, 100, 1, '2024-03-01 00:00:00', '2024-12-31 23:59:59', TRUE, 1, '2024-03-01 10:00:00'),
(2, 'YAZ25', 'Yaz sezonuna özel 25 TL indirim', 'FIXED_AMOUNT', 25.00, 150.00, 25.00, 50, 1, '2024-06-01 00:00:00', '2024-08-31 23:59:59', TRUE, 1, '2024-05-15 14:00:00');

-- Mesajlar
INSERT INTO messages (id, sender_id, receiver_id, subject, content, is_read, created_at) VALUES
(1, 6, 1, 'Sipariş hakkında', 'Merhaba, siparişim ne zaman teslim edilir?', FALSE, '2024-03-10 11:00:00'),
(2, 1, 6, 'Re: Sipariş hakkında', 'Merhaba, siparişiniz yarın teslim edilecektir.', TRUE, '2024-03-10 12:00:00'),
(3, 7, 1, 'Ürün sorunu', 'Gelen domateslerden bazıları ezilmişti.', FALSE, '2024-03-18 10:00:00');

-- Email Logları
INSERT INTO email_logs (id, recipient_email, recipient_name, subject, template, status, sent_at, created_at) VALUES
(1, 'mehmet.yilmaz@gmail.com', 'Mehmet Yılmaz', 'Hoş Geldiniz', 'WELCOME', 'SENT', '2024-01-05 14:30:00', '2024-01-05 14:30:00'),
(2, 'fatma.sahin@email.com', 'Fatma Şahin', 'Sipariş Onayı', 'ORDER_CONFIRMATION', 'SENT', '2024-03-01 10:05:00', '2024-03-01 10:05:00'),
(3, 'ahmet.ozdemir@email.com', 'Ahmet Özdemir', 'Sipariş Teslim Edildi', 'ORDER_STATUS_UPDATE', 'SENT', '2024-03-07 16:00:00', '2024-03-07 16:00:00');

-- Kullanıcı Favorileri
INSERT INTO user_favorites (id, user_id, product_id, created_at) VALUES
(1, 6, 4, '2024-02-15 10:00:00'),
(2, 6, 7, '2024-02-20 11:00:00'),
(3, 7, 1, '2024-02-25 09:00:00'),
(4, 8, 9, '2024-03-01 14:00:00');

-- Değerlendirmeler
INSERT INTO reviews (id, user_id, product_id, order_id, rating, comment, is_approved, created_at) VALUES
(1, 6, 1, 1, 5, 'Çok taze ve lezzetli domatesler, teşekkürler!', TRUE, '2024-03-05 10:00:00'),
(2, 7, 2, 2, 4, 'Güzel ama biraz küçüktü.', TRUE, '2024-03-10 11:00:00'),
(3, 8, 9, 7, 5, 'Harika bir peynir, kesinlikle tekrar alacağım.', TRUE, '2024-03-25 10:00:00'),
(4, 6, 7, 1, 5, 'Taze süt, çok beğendim.', TRUE, '2024-03-05 09:00:00'),
(5, 10, 4, 5, 4, 'Elmalar güzeldi.', TRUE, '2024-03-15 14:00:00');
