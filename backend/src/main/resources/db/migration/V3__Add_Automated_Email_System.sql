-- ============================================
-- Otomatik E-posta Sistemi ve Kullanici Bazli Komisyon
-- ============================================

-- Kullanici bazli komisyon oranlari
ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT NULL 
    COMMENT 'Kullanici bazli komisyon orani (NULL ise varsayilan kullanilir)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATETIME DEFAULT NULL 
    COMMENT 'Son giris tarihi';

ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0 
    COMMENT 'Toplam giris sayisi';

ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_date DATETIME DEFAULT CURRENT_TIMESTAMP 
    COMMENT 'Kayit tarihi';

-- Otomatik e-posta gorevleri tablosu
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    template_type VARCHAR(50) NOT NULL COMMENT 'WELCOME, ANNIVERSARY, INACTIVE vb.',
    scheduled_date DATETIME NOT NULL COMMENT 'Gonderilmesi planlanan tarih',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, SENT, FAILED',
    sent_date DATETIME DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_scheduled_emails_status (status),
    INDEX idx_scheduled_emails_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- E-posta loglari
CREATE TABLE IF NOT EXISTS email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    error_message TEXT DEFAULT NULL,
    opened_at DATETIME DEFAULT NULL COMMENT 'E-posta acilma tarihi (tracking)',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email_logs_user (user_id),
    INDEX idx_email_logs_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI Geri Cekme Planlari
CREATE TABLE IF NOT EXISTS user_retention_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_type VARCHAR(50) NOT NULL COMMENT 'INACTIVE, LOW_ENGAGEMENT vb.',
    ai_generated_plan TEXT NOT NULL COMMENT 'AI tarafindan uretilen plan',
    suggested_actions TEXT COMMENT 'Onerilen aksiyonlar',
    discount_code VARCHAR(50) DEFAULT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, APPLIED, EXPIRED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    applied_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_retention_plans_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;