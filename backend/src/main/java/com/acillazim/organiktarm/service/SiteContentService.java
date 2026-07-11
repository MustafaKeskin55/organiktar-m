package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.SiteContent;
import com.acillazim.organiktarm.repository.SiteContentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteContentService {
    
    private final SiteContentRepository siteContentRepository;
    private final ObjectMapper objectMapper;
    
    @PostConstruct
    @Transactional
    public void initDefaultContent() {
        // Hero İstatistikleri
        if (!siteContentRepository.existsByContentKey("hero_stats")) {
            SiteContent heroStats = new SiteContent();
            heroStats.setContentKey("hero_stats");
            heroStats.setContentType("HERO");
            heroStats.setContentData("""
                {
                  "stats": [
                    {"icon": "Leaf", "value": "0", "label": "Yerel Uretici", "dynamic": true, "source": "producer_count"},
                    {"icon": "Star", "value": "0", "label": "Mutlu Musteri", "dynamic": true, "source": "consumer_count"},
                    {"icon": "Truck", "value": "0", "label": "Teslimat", "dynamic": true, "source": "order_count"}
                  ],
                  "floating_badge": {
                    "text": "Yakinlarinizdaki",
                    "value": "0",
                    "suffix": "+ Uretici",
                    "dynamic": true,
                    "source": "nearby_producer_count"
                  }
                }
                """);
            heroStats.setDisplayOrder(1);
            siteContentRepository.save(heroStats);
        }
        
        // Nasıl Çalışır Adımları
        if (!siteContentRepository.existsByContentKey("how_it_works")) {
            SiteContent howItWorks = new SiteContent();
            howItWorks.setContentKey("how_it_works");
            howItWorks.setContentType("STEPS");
            howItWorks.setContentData("""
                {
                  "steps": [
                    {"icon": "Search", "title": "Kesfet", "description": "Yakinlarinizdaki ureticileri ve taze urunleri kesfedin.", "color": "bg-blue-100 text-blue-600"},
                    {"icon": "ShoppingCart", "title": "Siparis Ver", "description": "Sevdiginiz urunleri sepete ekleyin, tek tikla siparis verin.", "color": "bg-green-100 text-green-600"},
                    {"icon": "Truck", "title": "Kapiniza Gelsin", "description": "Taze urunler ureticiden dogrudan kapiniza teslim edilsin.", "color": "bg-orange-100 text-orange-600"},
                    {"icon": "Sprout", "title": "Destek Olun", "description": "Yerel ureticileri destekleyin, surdurulebilir tarimi tesvik edin.", "color": "bg-purple-100 text-purple-600"}
                  ]
                }
                """);
            howItWorks.setDisplayOrder(2);
            siteContentRepository.save(howItWorks);
        }
        
        // Müşteri Yorumları
        if (!siteContentRepository.existsByContentKey("testimonials")) {
            SiteContent testimonials = new SiteContent();
            testimonials.setContentKey("testimonials");
            testimonials.setContentType("TESTIMONIALS");
            testimonials.setContentData("""
                {
                  "testimonials": [
                    {"name": "Merve K.", "location": "Kadikoy, Istanbul", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", "rating": 5, "text": "Artik pazara gitmeye gerek kalmadi. Taze sebzelerim haftalik olarak kapima geliyor.", "role": "Abone"},
                    {"name": "Can Y.", "location": "Besiktas, Istanbul", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", "rating": 5, "text": "Zeytinyagi siparisi ettim, gercekten soguk sikim ve dogal. Tadi marketlerdekilerden cok farkli.", "role": "Musteri"},
                    {"name": "Elif T.", "location": "Uskudar, Istanbul", "rating": 5, "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", "text": "Cocuklarim icin guvenilir gida bulmak cok onemli. Organik urunlere uygun fiyata ulasiyorum.", "role": "Anne"}
                  ]
                }
                """);
            testimonials.setDisplayOrder(3);
            siteContentRepository.save(testimonials);
        }
        
        // Abonelik Planları
        if (!siteContentRepository.existsByContentKey("subscription_plans")) {
            SiteContent plans = new SiteContent();
            plans.setContentKey("subscription_plans");
            plans.setContentType("PLANS");
            plans.setContentData("""
                {
                  "plans": [
                    {
                      "name": "Mini Sepet",
                      "price": 149,
                      "period": "haftalik",
                      "description": "Bekarlar ve ciftler icin ideal",
                      "features": ["4-5 kg mevsim sebze & meyve", "2-3 cesit urun", "Ucretsiz teslimat", "Iptal edilebilir"],
                      "popular": false
                    },
                    {
                      "name": "Aile Sepeti",
                      "price": 299,
                      "period": "haftalik",
                      "description": "3-4 kisilik aileler icin",
                      "features": ["8-10 kg mevsim sebze & meyve", "5-6 cesit urun", "Ucretsiz teslimat", "Oncelikli musteri destegi", "Iptal edilebilir"],
                      "popular": true
                    },
                    {
                      "name": "Organik Sepet",
                      "price": 449,
                      "period": "haftalik",
                      "description": "Tamamen organik urunler",
                      "features": ["8-10 kg organik sebze & meyve", "Sertifikali organik urunler", "Ucretsiz teslimat", "Oncelikli musteri destegi", "Iptal edilebilir"],
                      "popular": false
                    }
                  ]
                }
                """);
            plans.setDisplayOrder(4);
            siteContentRepository.save(plans);
        }
        
        // ChatBot Mesajları
        if (!siteContentRepository.existsByContentKey("chatbot_responses")) {
            SiteContent chatbot = new SiteContent();
            chatbot.setContentKey("chatbot_responses");
            chatbot.setContentType("CHATBOT");
            chatbot.setContentData("""
                {
                  "welcome_message": "Merhaba! Organik Tarim'a hos geldiniz. Size nasil yardimci olabilirim?",
                  "quick_questions": [
                    "Kargo ucreti ne kadar?",
                    "Siparisim nerede?",
                    "Iade politikasi nedir?",
                    "Urunler organik mi?"
                  ],
                  "responses": {
                    "kargo": "Kargo ucretimiz 29.99 TL'dir. 250 TL uzeri siparislerde kargo ucretsizdir.",
                    "siparis": "Siparisinizi 'Siparislerim' sayfasindan takip edebilirsiniz.",
                    "iade": "Iade politikamiz: Teslimattan itibaren 14 gun icinde iade yapabilirsiniz.",
                    "organik": "Evet, tum urunlerimiz organik ve yerel ureticilerden gelmektedir."
                  }
                }
                """);
            chatbot.setDisplayOrder(5);
            siteContentRepository.save(chatbot);
        }
    }
    
    @Transactional(readOnly = true)
    public SiteContent getContentByKey(String contentKey) {
        return siteContentRepository.findByContentKey(contentKey)
                .orElseThrow(() -> new RuntimeException("Content not found: " + contentKey));
    }
    
    @Transactional(readOnly = true)
    public List<SiteContent> getAllActiveContent() {
        return siteContentRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }
    
    @Transactional(readOnly = true)
    public List<SiteContent> getContentByType(String contentType) {
        return siteContentRepository.findByContentTypeAndIsActiveTrueOrderByDisplayOrderAsc(contentType);
    }
    
    @Transactional
    public SiteContent updateContent(@NonNull Long id, @NonNull String contentData) {
        SiteContent content = siteContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        content.setContentData(contentData);
        return siteContentRepository.save(content);
    }
    
    public JsonNode parseContentData(SiteContent content) {
        try {
            return objectMapper.readTree(content.getContentData());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse content data", e);
        }
    }
}
