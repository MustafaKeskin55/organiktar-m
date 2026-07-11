-- ============================================
-- V2 Migration: Admin Panel Tables
-- Site Settings, Payment Settings, Financial Reports
-- ============================================

-- 1. Site Settings Table (Site Ayarları)
CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL DEFAULT 'Organik Tarım',
    site_description VARCHAR(500) DEFAULT 'Doğal ve organik ürünlerin buluşma noktası',
    contact_email VARCHAR(100) DEFAULT 'info@organiktarim.com',
    contact_phone VARCHAR(20) DEFAULT '0850 123 45 67',
    commission_rate DECIMAL(5,2) DEFAULT 5.00 COMMENT 'Platform komisyon oranı (%)',
    min_order_amount DECIMAL(10,2) DEFAULT 50.00 COMMENT 'Minimum sipariş tutarı',
    free_shipping_threshold DECIMAL(10,2) DEFAULT 250.00 COMMENT 'Ücretsiz kargo limiti',
    shipping_fee DECIMAL(10,2) DEFAULT 29.99 COMMENT 'Kargo ücreti',
    tax_rate DECIMAL(5,2) DEFAULT 20.00 COMMENT 'KDV oranı (%)',
    maintenance_mode BOOLEAN DEFAULT FALSE COMMENT 'Bakım modu',
    allow_registration BOOLEAN DEFAULT TRUE COMMENT 'Yeni kayıt izni',
    require_approval_for_products BOOLEAN DEFAULT TRUE COMMENT 'Ürün onayı zorunlu mu',
    auto_approve_producers BOOLEAN DEFAULT FALSE COMMENT 'Üreticiler otomatik onaylansın mı',
    currency VARCHAR(3) DEFAULT 'TRY' COMMENT 'Para birimi',
    language VARCHAR(10) DEFAULT 'tr' COMMENT 'Varsayılan dil',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul' COMMENT 'Zaman dilimi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Site genel ayarları';

-- Varsayılan site ayarları ekle
INSERT INTO site_settings (site_name, site_description, contact_email, contact_phone)
VALUES ('Organik Tarım', 'Doğal ve organik ürünlerin buluşma noktası', 'info@organiktarim.com', '0850 123 45 67')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Payment Settings Table (Ödeme Ayarları)
CREATE TABLE IF NOT EXISTS payment_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100) COMMENT 'Banka adı (Havale/EFT için)',
    account_holder VARCHAR(200) COMMENT 'Hesap sahibi adı',
    iban VARCHAR(34) COMMENT 'IBAN numarası',
    account_number VARCHAR(50) COMMENT 'Hesap numarası',
    branch_code VARCHAR(20) COMMENT 'Şube kodu',
    payment_gateway VARCHAR(20) DEFAULT 'NONE' COMMENT 'Sanal pos sağlayıcı: NONE, PAYTR, IYZICO, STRIPE, BRAINTREE, PAYPAL, PAYU',
    merchant_id VARCHAR(100) COMMENT 'Mağaza ID',
    merchant_key VARCHAR(500) COMMENT 'Mağaza anahtarı (şifreli)',
    merchant_salt VARCHAR(100) COMMENT 'Salt değeri',
    api_key VARCHAR(500) COMMENT 'API anahtarı (şifreli)',
    secret_key VARCHAR(500) COMMENT 'Gizli anahtar (şifreli)',
    is_test_mode BOOLEAN DEFAULT TRUE COMMENT 'Test modu aktif mi',
    is_active BOOLEAN DEFAULT FALSE COMMENT 'Ödeme aktif mi',
    allow_installments BOOLEAN DEFAULT FALSE COMMENT 'Taksit seçeneği',
    max_installment_count INT DEFAULT 6 COMMENT 'Maksimum taksit sayısı',
    min_installment_amount DECIMAL(10,2) DEFAULT 100.00 COMMENT 'Minimum taksit tutarı',
    installment_commission_rates TEXT COMMENT 'JSON formatında taksit komisyon oranları',
    supported_cards VARCHAR(200) COMMENT 'Desteklenen kartlar (Visa, MasterCard vb.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ödeme ayarları ve sanal pos bilgileri';

-- Varsayılan ödeme ayarları (aktif olmayan)
INSERT INTO payment_settings (payment_gateway, is_active, is_test_mode)
VALUES ('NONE', TRUE, TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- 3. Financial Reports Table (Finansal Raporlar)
CREATE TABLE IF NOT EXISTS financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_date DATE NOT NULL COMMENT 'Rapor tarihi',
    report_type VARCHAR(20) NOT NULL COMMENT 'Rapor tipi: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY',
    total_orders INT DEFAULT 0 COMMENT 'Toplam sipariş sayısı',
    total_revenue DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Toplam gelir',
    total_commission DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Toplam komisyon',
    net_revenue DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Net gelir (komisyon düşülmüş)',
    total_shipping DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Toplam kargo ücreti',
    total_tax DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Toplam KDV',
    cancelled_orders INT DEFAULT 0 COMMENT 'İptal edilen sipariş sayısı',
    cancelled_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT 'İptal edilen tutar',
    refunded_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT 'İade edilen tutar',
    new_users INT DEFAULT 0 COMMENT 'Yeni kullanıcı sayısı',
    new_producers INT DEFAULT 0 COMMENT 'Yeni üretici sayısı',
    new_products INT DEFAULT 0 COMMENT 'Yeni ürün sayısı',
    top_selling_category VARCHAR(50) COMMENT 'En çok satan kategori',
    avg_order_value DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Ortalama sipariş tutarı',
    conversion_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Dönüşüm oranı (%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_report_date_type (report_date, report_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Günlük, haftalık, aylık, yıllık finansal raporlar';

-- İndeksler
CREATE INDEX idx_financial_reports_date ON financial_reports(report_date);
CREATE INDEX idx_financial_reports_type ON financial_reports(report_type);

-- 4. Modify users table type column (if needed for new roles)
-- Zaten VARCHAR(20) olarak ayarlanmış olmalı ama kontrol edelim
ALTER TABLE users MODIFY COLUMN type VARCHAR(20) NOT NULL;

-- 4.1 Add is_active column to users table for soft delete/user suspension
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE COMMENT 'Kullanici aktif/pasif durumu';

-- 4.2 Create index for is_active column for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 4.3 Add force_password_change column for temporary password handling
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE COMMENT 'Gecici sifre ile giris sonrasi sifre degistirme zorunlulugu';

-- 5. Add admin user roles to users table (if not exists)
-- SUPER_ADMIN rolü ile site yöneticisi
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at)
SELECT * FROM (SELECT 'Site Yöneticisi', 'yonetici@organiktarim.com', 'M.ustafa536', '05001234567', 'SUPER_ADMIN', TRUE, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'yonetici@organiktarim.com'
) LIMIT 1;

-- MANAGER rolü ile müdür
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at)
SELECT * FROM (SELECT 'Müdür', 'mudur@organiktarim.com', 'M.ustafa536', '05001234568', 'MANAGER', TRUE, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'mudur@organiktarim.com'
) LIMIT 1;

-- FINANCE rolü ile maliyeci
INSERT INTO users (name, email, password, phone, type, is_active, created_at, updated_at)
SELECT * FROM (SELECT 'Maliyeci', 'maliyeci@organiktarim.com', 'M.ustafa536', '05001234569', 'FINANCE', TRUE, NOW(), NOW()) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'maliyeci@organiktarim.com'
) LIMIT 1;
