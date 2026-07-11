# Organik Tarım Backend

Java Spring Boot + MySQL REST API Backend

## Özellikler

- **Java 17** + **Spring Boot 3.2**
- **MySQL** Veritabanı
- **JPA/Hibernate** ORM
- **Spring Security** + **JWT** (hazır entegrasyon)
- **REST API** Endpoints

## Proje Yapısı

```
backend/
├── src/main/java/com/acillazim/organiktarm/
│   ├── entity/          # Database entities
│   │   ├── User.java
│   │   ├── Product.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   └── Address.java
│   ├── repository/      # JPA Repositories
│   ├── service/         # Business Logic
│   ├── controller/      # REST Controllers
│   ├── dto/            # Data Transfer Objects
│   └── config/         # Configurations
└── src/main/resources/
    └── application.properties
```

## API Endpoints

### Products
- `GET /api/products` - Tüm ürünler
- `GET /api/products/{id}` - Ürün detayı
- `GET /api/products/producer/{producerId}` - Üreticinin ürünleri
- `GET /api/products/category/{category}` - Kategoriye göre ürünler
- `GET /api/products/filter` - Filtreli ürünler
- `POST /api/products?producerId={id}` - Yeni ürün ekle
- `PUT /api/products/{id}` - Ürün güncelle
- `DELETE /api/products/{id}` - Ürün sil

### Users
- `GET /api/users` - Tüm kullanıcılar
- `GET /api/users/{id}` - Kullanıcı detayı
- `POST /api/users` - Yeni kullanıcı
- `PUT /api/users/{id}` - Kullanıcı güncelle
- `DELETE /api/users/{id}` - Kullanıcı sil

## Kurulum ve Çalıştırma

### 1. MySQL Kurulum

```sql
CREATE DATABASE organiktarim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'organik'@'localhost' IDENTIFIED BY 'organik123';
GRANT ALL PRIVILEGES ON organiktarim.* TO 'organik'@'localhost';
FLUSH PRIVILEGES;
```

### 2. application.properties Güncelleme

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/organiktarim?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=organik
spring.datasource.password=organik123
```

### 3. Maven Bağımlılıkları

```bash
cd backend
mvn clean install
```

### 4. Uygulamayı Çalıştır

```bash
mvn spring-boot:run
```

Uygulama `http://localhost:8080` adresinde çalışacak.

## Frontend ile Bağlantı

Frontend'de `src/lib/api.ts` dosyası backend'e bağlanıyor:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

CORS ayarları `SecurityConfig.java`'da açık:

```java
@CrossOrigin(origins = "*")
```

## Güvenlik

- Şifreler BCrypt ile hashleniyor
- JWT token desteği hazır (aktifleştirilebilir)
- API endpoints CORS açık (geliştirme için)
