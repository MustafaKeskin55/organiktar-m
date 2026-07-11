-- ============================================
-- ÇİFTÇİDENKAPINA - TAM SİSTEM VERİTABANI
-- İndirim Kodu + Mesajlaşma + Admin Panel
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
-- 1. KULLANICILAR TABLOSU
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

-- ============================================
-- 2. İNDİRİM KODU SİSTEMİ (DETAYLI)
-- ============================================
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Kod: INDIRIM20',
    description VARCHAR(255) COMMENT 'Açıklama',
    discount_type ENUM('PERCENTAGE', 'FIXED') NOT NULL COMMENT 'Yüzde veya Sabit',
    discount_value DECIMAL(10,2) NOT NULL COMMENT 'İndirim değeri',
    min_order_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Min. sipariş tutarı',
    max_discount_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Max. indirim limiti',
    usage_limit INT DEFAULT NULL COMMENT 'Toplam kullanım limiti',
    usage_count INT DEFAULT 0 COMMENT 'Kaç kez kullanıldı',
    per_user_limit INT DEFAULT 1 COMMENT 'Kullanıcı başına limit',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT COMMENT 'Oluşturan admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- İndirim Kodları
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, start_date, end_date, is_active, created_by) VALUES
('INDIRIM20', 'Yeni müşterilere özel %20 indirim', 'PERCENTAGE', 20.00, 100.00, 100.00, 100, 1, '2024-01-01', '2024-12-31', TRUE, 1),
('HOSGELDIN50', 'Hoş geldin 50 TL indirim', 'FIXED', 50.00, 200.00, NULL, 50, 1, '2024-01-01', '2024-12-31', TRUE, 1),
('RAMAZAN15', 'Ramazan ayına özel %15', 'PERCENTAGE', 15.00, 150.00, 75.00, NULL, 1, '2024-03-01', '2024-04-30', TRUE, 1),
('UYE10', 'Üyelere özel %10 indirim', 'PERCENTAGE', 10.00, 0, 50.00, NULL, 2, '2024-01-01', '2024-12-31', TRUE, 1),
('SEPET100', '100 TL üzeri 25 TL indirim', 'FIXED', 25.00, 100.00, NULL, 200, 1, '2024-01-01', '2024-12-31', TRUE, 1);

-- ============================================
-- 3. MESAJLAŞMA SİSTEMİ (SADECE ADMIN'E)
-- ============================================
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL COMMENT 'Gönderen (sadece kullanıcı)',
    receiver_id BIGINT NOT NULL COMMENT 'Alıcı (sadece admin)',
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type ENUM('GENERAL', 'ORDER', 'PRODUCT', 'COMPLAINT', 'SUPPORT', 'REPLY') DEFAULT 'GENERAL',
    related_order_id BIGINT DEFAULT NULL,
    related_product_id BIGINT DEFAULT NULL,
    parent_message_id BIGINT DEFAULT NULL COMMENT 'Yanıtlanan mesaj (thread)',
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mesajlar (Kullanıcı → Admin)
INSERT INTO messages (sender_id, receiver_id, subject, content, message_type, related_order_id, is_read, created_at) VALUES
(6, 1, 'Sipariş Hakkında', 'Merhaba, siparişim ne zaman hazırlanır?', 'ORDER', 1, TRUE, '2024-03-15'),
(1, 6, 'Re: Sipariş Hakkında', 'Merhaba Fatma Hanım, siparişiniz yarın kargoya verilecek.', 'REPLY', 1, FALSE, '2024-03-15'),
(7, 1, 'Ürün Sorusu', 'Organik mi bu ürünler?', 'PRODUCT', NULL, TRUE, '2024-03-10'),
(1, 7, 'Re: Ürün Sorusu', 'Evet, tüm ürünlerimiz organik sertifikalıdır.', 'REPLY', NULL, FALSE, '2024-03-10'),
(8, 1, 'Şikayet', 'Kargo gecikti, yardımcı olur musunuz?', 'COMPLAINT', 5, FALSE, '2024-03-12'),
(3, 1, 'Destek Talebi', 'Ürünlerimi nasıl ekleyebilirim?', 'SUPPORT', NULL, TRUE, '2024-03-16'),
(1, 3, 'Re: Destek Talebi', 'Satıcı panelinden ürün ekleyebilirsiniz.', 'REPLY', NULL, FALSE, '2024-03-16');

-- ============================================
-- 4. BİLDİRİMLER
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

-- Bildirimler
INSERT INTO notifications (user_id, title, content, notification_type, related_entity_id, is_read) VALUES
(3, 'Yeni Sipariş', 'Yeni bir siparişiniz var #ORD-001', 'ORDER', 1, TRUE),
(3, 'Sipariş Hazırlandı', 'Siparişiniz kargoya verildi', 'ORDER', 1, TRUE),
(6, 'Mesajınız Var', 'Admin size yanıt verdi', 'MESSAGE', 1, FALSE),
(7, 'İndirim Kodu', '%20 indirim kodunuz: INDIRIM20', 'COUPON', 1, FALSE),
(8, 'Sistem Bakımı', 'Sistem 02:00-04:00 bakımda', 'SYSTEM', NULL, TRUE);

-- ============================================
-- 5. DİĞER TABLOLAR (Kategori, Ürün, Sipariş vb.)
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (id, name, description) VALUES
(1, 'Meyve', 'Taze meyveler'),
(2, 'Sebze', 'Organik sebzeler'),
(3, 'Süt Ürünleri', 'Doğal süt ürünleri'),
(4, 'Kahvaltılık', 'Kahvaltı ürünleri'),
(5, 'Zeytinyağı', 'Soğuk sıkım zeytinyağları');

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
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (producer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO products (id, name, description, price, stock, category_id, producer_id, is_organic) VALUES
(1, 'Amasya Elması', 'Taze Amasya elması', 35.00, 150, 1, 3, TRUE),
(2, 'Domates', 'Salkım domates', 25.00, 500, 2, 3, TRUE),
(3, 'Köy Peyniri', 'Taze köy peyniri', 180.00, 100, 3, 4, TRUE),
(4, 'Organik Bal', 'Süzme çiçek balı', 350.00, 150, 4, 3, TRUE),
(5, 'Soğuk Sıkım Zeytinyağı', 'Naturel sızma', 280.00, 200, 5, 3, TRUE);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 30.00,
    final_amount DECIMAL(10,2) NOT NULL,
    status ENUM('BEKLEMEDE', 'HAZIRLANIYOR', 'YOLDA', 'TESLIM_EDILDI', 'IPTAL') DEFAULT 'BEKLEMEDE',
    payment_method ENUM('CARD', 'TRANSFER', 'COD') DEFAULT 'TRANSFER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO orders (order_number, user_id, total_amount, final_amount, status, created_at) VALUES
('ORD-2024-001', 6, 450.00, 480.00, 'TESLIM_EDILDI', '2024-03-15'),
('ORD-2024-002', 6, 280.00, 310.00, 'HAZIRLANIYOR', '2024-03-20'),
('ORD-2024-003', 7, 650.00, 680.00, 'TESLIM_EDILDI', '2024-03-10');

-- ============================================
-- İNDEKSLEME
-- ============================================
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, start_date, end_date);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================
-- TAMAMLANDI
-- ============================================
-- Tüm sistem hazır!
-- Admin: admin@ciftcidenkapina.com / TempPass123!
-- ============================================