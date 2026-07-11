-- ============================================
-- Detayli Indirim Kodu (Coupon) Sistemi
-- ============================================

-- Indirim kodlari tablosu
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Indirim kodu (ornek: INDIRIM20)',
    description VARCHAR(255) COMMENT 'Aciklama',
    discount_type VARCHAR(20) NOT NULL COMMENT 'PERCENTAGE (yuzde) veya FIXED (sabit tutar)',
    discount_value DECIMAL(10,2) NOT NULL COMMENT 'Indirim degeri (yuzde ise 0-100, sabit ise TL)',
    min_order_amount DECIMAL(10,2) DEFAULT 0 COMMENT 'Minimum siparis tutari (0 ise sinirsiz)',
    max_discount_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Maksimum indirim tutari (yuzdelik indirimler icin)',
    usage_limit INT DEFAULT NULL COMMENT 'Kac kez kullanilabilir (NULL ise sinirsiz)',
    usage_count INT DEFAULT 0 COMMENT 'Su ana kadar kac kez kullanildi',
    per_user_limit INT DEFAULT 1 COMMENT 'Kullanici basina kullanim limiti',
    start_date DATETIME NOT NULL COMMENT 'Baslangic tarihi',
    end_date DATETIME NOT NULL COMMENT 'Bitis tarihi',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Aktif mi?',
    created_by BIGINT COMMENT 'Olusturan admin kullanici ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_active (is_active, start_date, end_date),
    INDEX idx_coupons_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indirim kodu - Kategori iliskisi (Hangi kategorilerde gecerli)
CREATE TABLE IF NOT EXISTS coupon_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coupon_category (coupon_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indirim kodu - Urun iliskisi (Hangi urunlerde gecerli - NULL ise tum urunler)
CREATE TABLE IF NOT EXISTS coupon_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coupon_product (coupon_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indirim kodu - Kullanici iliskisi (Hangi kullanicilara ozel - NULL ise herkes)
CREATE TABLE IF NOT EXISTS coupon_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    usage_count INT DEFAULT 0 COMMENT 'Bu kullanici kac kez kullandi',
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_coupon_user (coupon_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kullanici indirim kodu kullanim logu
CREATE TABLE IF NOT EXISTS coupon_usage_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL COMMENT 'Uygulanan indirim tutari',
    original_amount DECIMAL(10,2) NOT NULL COMMENT 'Indirim oncesi tutar',
    final_amount DECIMAL(10,2) NOT NULL COMMENT 'Indirim sonrasi tutar',
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_coupon_usage_user (user_id),
    INDEX idx_coupon_usage_coupon (coupon_id),
    INDEX idx_coupon_usage_date (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Kullanici Mesajlasma Sistemi
-- ============================================

-- Mesajlar tablosu (Kullanici <-> Admin / Kullanici <-> Satıcı)
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL COMMENT 'Gonderen kullanici ID',
    receiver_id BIGINT NOT NULL COMMENT 'Alici kullanici ID',
    subject VARCHAR(255) COMMENT 'Mesaj konusu',
    content TEXT NOT NULL COMMENT 'Mesaj icerigi',
    message_type VARCHAR(50) DEFAULT 'GENERAL' COMMENT 'GENERAL, ORDER, PRODUCT, COMPLAINT, SUPPORT',
    related_order_id BIGINT DEFAULT NULL COMMENT 'Iliskili siparis (varsa)',
    related_product_id BIGINT DEFAULT NULL COMMENT 'Iliskili urun (varsa)',
    parent_message_id BIGINT DEFAULT NULL COMMENT 'Yanitlanan mesaj ID (thread icin)',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Okundu mu?',
    read_at DATETIME DEFAULT NULL COMMENT 'Okunma tarihi',
    is_deleted_by_sender BOOLEAN DEFAULT FALSE COMMENT 'Gonderen tarafindan silindi mi?',
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE COMMENT 'Alici tarafindan silindi mi?',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_read (receiver_id, is_read),
    INDEX idx_messages_type (message_type),
    INDEX idx_messages_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mesaj ekleri (Dosya, resim vb.)
CREATE TABLE IF NOT EXISTS message_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) COMMENT 'IMAGE, PDF, DOC vb.',
    file_size INT COMMENT 'Dosya boyutu (byte)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bildirimler tablosu (Anlik bildirimler icin)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Bildirim alan kullanici',
    title VARCHAR(255) NOT NULL,
    content TEXT,
    notification_type VARCHAR(50) DEFAULT 'GENERAL' COMMENT 'ORDER, MESSAGE, PROMOTION, SYSTEM',
    related_entity_id BIGINT DEFAULT NULL COMMENT 'Iliskili kayit ID (siparis, mesaj vb.)',
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Admin Mesaj Yonetimi (Toplu Mesajlar)
-- ============================================

-- Admin toplu mesajlari
CREATE TABLE IF NOT EXISTS admin_broadcasts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL COMMENT 'Gonderen admin',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    broadcast_type VARCHAR(50) DEFAULT 'ALL' COMMENT 'ALL, CONSUMERS, PRODUCERS, SPECIFIC_USERS',
    target_filter TEXT COMMENT 'Hedef kitle filtresi (JSON formatinda)',
    sent_count INT DEFAULT 0 COMMENT 'Kac kisiye gonderildi',
    read_count INT DEFAULT 0 COMMENT 'Kac kisi okudu',
    scheduled_at DATETIME DEFAULT NULL COMMENT 'Planlanan gonderim zamani (NULL ise hemen)',
    sent_at DATETIME DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'DRAFT, SCHEDULED, SENDING, SENT, FAILED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id),
    INDEX idx_broadcasts_status (status),
    INDEX idx_broadcasts_scheduled (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin mesajlari - Kullanici iliskisi (Kimin aldığı)
CREATE TABLE IF NOT EXISTS admin_broadcast_recipients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    broadcast_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME DEFAULT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (broadcast_id) REFERENCES admin_broadcasts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_broadcast_user (broadcast_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Email sablonlari (Admin tarafindan yonetilen)
CREATE TABLE IF NOT EXISTS email_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(50) NOT NULL UNIQUE COMMENT 'Sablona erisim anahtari',
    name VARCHAR(255) NOT NULL COMMENT 'Gorunur adi',
    subject VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL COMMENT 'HTML icerik',
    content_text TEXT COMMENT 'Duz metin icerik',
    variables TEXT COMMENT 'Kullanilabilir degiskenler (JSON array)',
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    updated_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;