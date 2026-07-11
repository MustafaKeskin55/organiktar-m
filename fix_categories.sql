-- Eksik kategori düzeltmesi
USE ciftcidenkapina;

-- sut-urunleri -> SUT (Java enum değeri)
UPDATE products SET category = 'SUT' WHERE category = 'sut-urunleri';

-- Sonucu doğrula
SELECT DISTINCT category FROM products;
