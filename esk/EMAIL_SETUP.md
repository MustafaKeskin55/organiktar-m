# 📧 E-Posta (SMTP) Ayarları

## 1. Gmail ile Hızlı Başlangıç (Test için)

`backend/src/main/resources/application.properties` dosyasına şunları ekleyin:

```properties
# ==========================================
# EMAIL (SMTP) CONFIGURATION
# ==========================================

# Gmail SMTP ayarları (Test için)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=sizin-email@gmail.com
spring.mail.password=uygulama-sifresi  # Gmail şifreniz değil, Uygulama Şifresi
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com

# E-posta servisini aktif et
app.mail.enabled=true
```

### Gmail Uygulama Şifresi Nasıl Alınır?

1. Google Hesabınıza gidin: https://myaccount.google.com
2. **Güvenlik** → **2 Adımlı Doğrulama** (etkinleştirin)
3. **Uygulama Şifreleri** → Şifre oluştur
4. Uygulama seç: **Diğer (Özel ad)**
5. Ad gir: `Organik Tarım`
6. **Oluştur** → 16 haneli şifreyi kopyalayın

---

## 2. Yandex Mail (Kolay alternatif)

```properties
spring.mail.host=smtp.yandex.com
spring.mail.port=465
spring.mail.username=sizin-email@yandex.com
spring.mail.password=email-sifreniz
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.yandex.com
app.mail.enabled=true
```

---

## 3. Özel Mail Sunucusu

```properties
spring.mail.host=mail.sizindomain.com
spring.mail.port=587
spring.mail.username=info@sizindomain.com
spring.mail.password=sifreniz
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.mail.enabled=true
```

---

## ⚠️ Önemli Notlar

- **Gmail**: Normal şifre yerine "Uygulama Şifresi" kullanın
- **Güvenlik**: Canlı ortamda şifreyi `application.properties`'te tutmayın, environment variable kullanın
- **Log**: E-posta gönderme durumları console'da görünür
- **Test**: Ayarlardan sonra `/api/admin/settings` endpoint'inden test edin

---

## 🔍 Test

Admin panelden bir kullanıcıya e-posta göndererek test edin.
