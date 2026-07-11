# Gmail Güvenlik Ayarı - Authentication Failed Çözümü

## 🔐 Sorun: Gmail Kimlik Doğrulama Başarısız

Gmail normal şifreleri artık kabul etmiyor. 2 seçeneğiniz var:

---

## ✅ Seçenek 1: Daha Az Güvenli Uygulama Erişimi (Kolay - Önerilen)

1. https://myaccount.google.com/lesssecureapps adresine gidin
2. **Daha az güvenli uygulama erişimi** seçeneğini **AÇIK** yapın
3. Tekrar deneyin

⚠️ **Not:** Bu seçenek Gmail hesabınızı daha az güvenli yapar ama hızlı çözümdür.

---

## ✅ Seçenek 2: 2 Adımlı Doğrulama + Uygulama Şifresi (Güvenli)

1. https://myaccount.google.com/signinoptions/two-step-verification
   - 2 Adımlı Doğrulamayı **AKTİF EDİN**
   
2. https://myaccount.google.com/apppasswords
   - **Uygulama seçin:** Posta
   - **Cihaz seçin:** Windows Bilgisayar
   - **Oluştur**'a tıklayın
   - **16 haneli şifreyi** kopyalayın

3. `application.properties` dosyasına yapıştırın:
```properties
spring.mail.password=abcd efgh ijkl mnop  (16 haneli şifre)
```

---

## 🔧 Ek Ayar: Display Name (Gönderen İsmi)

Gmail'de gönderen ismini "ÇiftçidenKapına" yapmak için:

1. https://mail.google.com adresine gidin
2. **Ayarlar** (⚙️) → **Tüm Ayarlar** → **Hesaplar ve İçe Aktarma**
3. **E-posta gönder** bölümünde **Kendi adınıza e-posta gönderin**'e tıklayın
4. **Bir sonraki adımı** tıklayın
5. **İsim:** `ÇiftçidenKapına` yazın
6. Kaydedin

---

## 🚀 Test

```powershell
# Backend'i yeniden başlatın
cd "C:\Users\musta\OneDrive\Masaüstü\ACİLLAZIM.COM\organik tarım\backend"
.\gradlew.bat bootRun
```

Admin panelden e-posta göndermeyi deneyin.
