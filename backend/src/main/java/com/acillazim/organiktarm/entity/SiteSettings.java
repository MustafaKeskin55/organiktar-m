package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "site_name", nullable = false)
    private String siteName = "Organik Tarım";
    
    @Column(name = "site_description")
    private String siteDescription = "Doğal ve organik ürünlerin buluşma noktası";
    
    @Column(name = "contact_email")
    private String contactEmail = "info@organiktarim.com";
    
    @Column(name = "contact_phone")
    private String contactPhone = "0850 123 45 67";
    
    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate = new BigDecimal("5.00"); // Varsayılan %5 komisyon
    
    @Column(name = "min_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount = new BigDecimal("50.00"); // Minimum sipariş tutarı
    
    @Column(name = "free_shipping_threshold", precision = 10, scale = 2)
    private BigDecimal freeShippingThreshold = new BigDecimal("250.00"); // Ücretsiz kargo limiti
    
    @Column(name = "shipping_fee", precision = 10, scale = 2)
    private BigDecimal shippingFee = new BigDecimal("29.99"); // Kargo ücreti
    
    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = new BigDecimal("20.00"); // KDV oranı %20
    
    @Column(name = "maintenance_mode")
    private Boolean maintenanceMode = false; // Bakım modu
    
    @Column(name = "allow_registration")
    private Boolean allowRegistration = true; // Yeni kayıt izni
    
    @Column(name = "require_approval_for_products")
    private Boolean requireApprovalForProducts = true; // Ürün onayı zorunlu mu
    
    @Column(name = "auto_approve_producers")
    private Boolean autoApproveProducers = false; // Üreticiler otomatik onaylansın mı
    
    @Column(name = "currency", length = 3)
    private String currency = "TRY"; // Para birimi
    
    @Column(name = "language", length = 10)
    private String language = "tr"; // Varsayılan dil
    
    @Column(name = "timezone", length = 50)
    private String timezone = "Europe/Istanbul"; // Zaman dilimi
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
