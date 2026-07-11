-- User type'ları düzelt (büyük harf yap)
USE ciftcidenkapina;

-- Mevcut değerleri gör
SELECT id, name, email, type FROM users;

-- super_admin -> SUPER_ADMIN
UPDATE users SET type = 'SUPER_ADMIN' WHERE type = 'super_admin';

-- consumer -> CONSUMER
UPDATE users SET type = 'CONSUMER' WHERE type = 'consumer';

-- producer -> PRODUCER  
UPDATE users SET type = 'PRODUCER' WHERE type = 'producer';

-- manager -> MANAGER
UPDATE users SET type = 'MANAGER' WHERE type = 'manager';

-- finance -> FINANCE
UPDATE users SET type = 'FINANCE' WHERE type = 'finance';

-- Sonucu doğrula
SELECT id, name, email, type FROM users;
