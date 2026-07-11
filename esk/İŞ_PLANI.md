# ÇiftçidenKapına - İş Planı

## Proje Özeti
**ÇiftçidenKapına**, Türkiye'deki yerel üreticileri (çiftçiler, zanaatkârlar) doğrudan tüketicilerle buluşturan dijital bir platformdur. Aracısız, şeffaf ve sürdürülebilir bir gıda ekosistemi sunar.

---

## 🎯 Problem ve Çözüm

### Problem
- Üreticiler ürünlerini değerinde satamıyor (aracıların yüksek komisyonları)
- Tüketiciler taze, güvenilir ve uygun fiyatlı ürün bulamıyor
- Yerel ekonomi desteklenmiyor
- Gıda israfı yüksek (aracı sistemi nedeniyle)

### Çözüm
- Doğrudan üretici-tüketici bağlantısı
- Haftalık/sezonluk abonelik kutuları
- Şeffaf fiyatlandırma ve üretici hikayeleri
- Kapıda teslimat sistemi

---

## 💼 İş Modeli

### Gelir Akışları

| Gelir Kaynağı | Açıklama | Oran/Komisyon |
|--------------|----------|---------------|
| **Komisyon** | Her satıştan | %10-15 |
| **Abonelik** | Haftalık/aylık kutu | 29-99 TL/hafta |
| **Premium Üyelik** | Üreticiler için | 49 TL/ay |
| **Reklam** | Öne çıkan ürünler | CPC/CPM |
| **Kargo** | Anlaşmalı kargo komisyonu | %5-10 |

### Maliyet Yapısı
- Teknoloji altyapısı (sunucu, domain)
- Kargo operasyonları
- Müşteri hizmetleri
- Pazarlama/büyüme

---

## 👥 Hedef Kitle

### Birincil (Üreticiler)
- Küçük ve orta ölçekli çiftçiler
- Organik üreticiler
- Kadın kooperatifleri
- Yerel zanaatkârlar (peynir, zeytinyağı, bal)

### İkincil (Tüketiciler)
- 25-45 yaş, şehirli
- Sağlıklı yaşam ve organik gıda bilinci yüksek
- Aileler (çocuklu)
- Sürdürülebilirlik odaklı
- Haftalık pazar alışverişi yapanlar

---

## 🚀 Özellik Listesi

### MVP (Minimum Viable Product)

#### Üretici Paneli
- [x] Kayıt ve profil oluşturma
- [x] Ürün ekleme/düzenleme/silme
- [x] Stok yönetimi
- [x] Sipariş takibi
- [x] Kazanç raporları
- [x] Üretici hikayesi (hakkımda)

#### Tüketici Paneli
- [x] Konum bazlı üretici/ürün arama
- [x] Ürün detay sayfaları
- [x] Sepet ve ödeme
- [x] Sipariş takibi
- [x] Favori üreticiler/ürünler
- [x] Değerlendirme/yorum sistemi

#### Abonelik Sistemi
- [x] Haftalık kutu oluşturma
- [x] Sebze/meyve/özel kutu seçenekleri
- [x] Otomatik ödeme
- [x] Durdurma/iptal esnekliği

#### Platform Özellikleri
- [x] Harita entegrasyonu (yakındaki üreticiler)
- [x] Güven skoru (değerlendirme sistemi)
- [x] Canlı destek chat
- [x] Bildirim sistemi

---

## 📱 Ekranlar ve Akış

### 1. Landing Page
- Hero bölümü (değer önerisi)
- Nasıl çalışır?
- Öne çıkan üreticiler
- Kategori kartları
- Müşteri yorumları
- CTA (Kayıt ol)

### 2. Üretici Dashboard
- Özet istatistikler
- Günlük/haftalık siparişler
- Stok uyarıları
- Mesajlar

### 3. Tüketici Ana Sayfa
- Yakındaki üreticiler (harita)
- Popüler ürünler
- Abonelik önerileri
- Kategoriler

### 4. Ürün Detay
- Ürün fotoğrafları
- Üretici bilgisi
- Fiyat ve birim
- Sepete ekle
- Yorumlar

### 5. Sepet ve Ödeme
- Ürün listesi
- Teslimat adresi
- Ödeme yöntemi
- Sipariş özeti

---

## 🛠 Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Routing | React Router v6 |
| Harita | Leaflet / Google Maps |
| Ödeme | iyzico (entegrasyon hazır) |
| Backend | Firebase / Supabase |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| Bildirim | Firebase Cloud Messaging |

---

## 📈 Büyüme Stratejisi

### Faz 1: İstanbul (0-6 ay)
- 50 üretici onboard
- 1000 aktif tüketici
- 3 ilçe pilot (Kadıköy, Beşiktaş, Üsküdar)

### Faz 2: Büyükşehirler (6-12 ay)
- Ankara, İzmir, Bursa
- 500 üretici
- 10,000 tüketici

### Faz 3: Türkiye Geneli (12-24 ay)
- Tüm iller
- 5,000+ üretici
- 100,000+ tüketici

---

## 💰 Finansal Projeksiyon

### Yıl 1
- Gelir: 500,000 TL
- Maliyet: 400,000 TL
- Kar: 100,000 TL

### Yıl 2
- Gelir: 3,000,000 TL
- Maliyet: 2,000,000 TL
- Kar: 1,000,000 TL

### Yıl 3
- Gelir: 10,000,000 TL
- Maliyet: 6,000,000 TL
- Kar: 4,000,000 TL

---

## ⚠️ Riskler ve Çözümler

| Risk | Olasılık | Çözüm |
|------|----------|-------|
| Üretici onboard zorluğu | Yüksek | Sahada ekip, kooperatif ortaklıkları |
| Kargo sorunları | Orta | Anlaşmalı kargo, kendi filo (ileride) |
| Kalite şikayetleri | Orta | Üretici eğitimi, para iadesi politikası |
| Büyük rakipler | Düşük | Niş odaklanma, yerel bağlar |

---

## 🎨 Marka Kimliği

### Renkler
- **Ana**: Yeşil (#22c55e) - Doğa, tazelik
- **İkincil**: Turuncu (#f97316) - Hasat, sıcaklık
- **Nötr**: Gri tonları

### Ton
- Samimi, güvenilir
- Yerel, köyümsü
- Modern ama sıcak

---

## 📋 Sonraki Adımlar

1. ✅ MVP geliştirme (Web)
2. 🔄 Beta test (100 kullanıcı)
3. ⏳ Mobil uygulama (React Native)
4. ⏳ Yatırım turu
5. ⏳ Ölçeklendirme

---

*Hazırlayan: ÇiftçidenKapına Ekibi*  
*Tarih: 2026*
