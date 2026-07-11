-- Payment method enum düzeltme
USE ciftcidenkapina;

-- Mevcut değerleri gör
SELECT DISTINCT payment_method FROM orders;

-- CREDIT_CARD -> CARD
UPDATE orders SET payment_method = 'CARD' WHERE payment_method = 'CREDIT_CARD';

-- Eğer başka değerler varsa:
-- BANK_TRANSFER -> TRANSFER
UPDATE orders SET payment_method = 'TRANSFER' WHERE payment_method = 'BANK_TRANSFER';

-- CASH_ON_DELIVERY -> COD
UPDATE orders SET payment_method = 'COD' WHERE payment_method = 'CASH_ON_DELIVERY';

-- Sonucu doğrula
SELECT DISTINCT payment_method FROM orders;
