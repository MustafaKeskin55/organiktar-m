# Gmail Kurulum - mustafakeksinn@gmail.com

## Adım 1: 2 Adımlı Doğrulamayı Açın
1. https://myaccount.google.com adresine gidin
2. **Güvenlik** sekmesine tıklayın
3. **2 Adımlı Doğrulama** bölümüne gidin
4. **Başlayın** → Telefon numaranızı girin → Kodu onaylayın
5. 2 adımlı doğrulama **AKTİF** olsun

## Adım 2: Uygulama Şifresi Oluşturun
1. Aynı sayfada (Güvenlik) aşağı kaydırın
2. **Uygulama Şifreleri** bölümünü bulun
3. **Şifre oluştur**'a tıklayın
4. Uygulama seçin: **Diğer (Özel ad)**
5. Ad girin: `Organik Tarim`
6. **Oluştur**'a tıklayın
7. **16 haneli şifre** görünecek (örn: `abcd efgh ijkl mnop`)
8. Bu şifreyi kopyalayın (boşluklarla beraber)

## Adım 3: Ayarları Güncelleyin
Dosya: `backend/src/main/resources/application.properties`

```properties
spring.mail.username=mustafakeksinn@gmail.com
spring.mail.password=abcd efgh ijkl mnop
```

**Not:** 16 haneli şifreyi olduğu gibi yazın (boşluklarla beraber)

## Adım 4: Yeniden Başlatın
```powershell
cd "C:\Users\musta\OneDrive\Masaüstü\ACİLLAZIM.COM\organik tarım\backend"
.\gradlew.bat bootRun
```

## Sorun Olursa
- Eğer "Uygulama Şifreleri" gözükmüyorsa → 2 adımlı doğrulama aktif değildir
- Eğer hata alırsanız → Şifreyi kopyalayıp yapıştırın (elle yazmayın)
