# Backend WebSocket Başlatma Talimatları

## Canlı (Real-time) Sistem Çalıştırma

WebSocket'in çalışması için backend'in derlenip çalıştırılması gerekiyor.

### 1. Maven ile Derleme ve Çalıştırma

```bash
# Backend klasörüne git
cd backend

# Maven ile derle ve çalıştır
mvn clean spring-boot:run
```

### 2. Veya JAR Dosyası Oluşturma

```bash
# JAR dosyası oluştur
mvn clean package -DskipTests

# JAR'ı çalıştır
java -jar target/organik-tarim-backend-1.0.0.jar
```

### 3. WebSocket Endpoint'leri

Backend çalıştığında şu endpoint'ler aktif olur:

| Endpoint | Açıklama |
|----------|----------|
| `http://localhost:8081/ws` | WebSocket bağlantı noktası |
| `http://localhost:8081/ws/info` | SockJS info endpoint'i |
| `/topic/products` | Ürün değişiklikleri kanalı |
| `/topic/orders` | Sipariş değişiklikleri kanalı |
| `/queue/orders/{userId}` | Kullanıcıya özel sipariş kanalı |

### 4. WebSocket Mesaj Tipleri

**Ürün Mesajları:**
- `PRODUCT_CREATED` - Yeni ürün eklendi
- `PRODUCT_UPDATED` - Ürün güncellendi
- `PRODUCT_DEACTIVATED` - Ürün pasife alındı
- `PRODUCT_ACTIVATED` - Ürün aktife alındı

**Sipariş Mesajları:**
- `ORDER_CREATED` - Yeni sipariş oluşturuldu
- `ORDER_STATUS_UPDATED` - Sipariş durumu değişti
- `ORDER_CANCELLED` - Sipariş iptal edildi

### 5. Sorun Giderme

**404 Hatası Alırsanız:**
1. Backend'in çalıştığından emin olun: `http://localhost:8081/api/products`
2. WebSocket dependency'sinin pom.xml'de olduğunu kontrol edin
3. WebSocketConfig.java'nın doğru pakette olduğunu kontrol edin

**Bağlantı Hatası Alırsanız:**
1. Port 8081'in kullanımda olmadığını kontrol edin
2. Firewall ayarlarını kontrol edin
3. CORS ayarlarının doğru olduğunu kontrol edin
