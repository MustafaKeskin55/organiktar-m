package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // IBAN Bilgileri (Havale/EFT için)
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "account_holder")
    private String accountHolder; // Hesap sahibi adı
    
    @Column(name = "iban")
    private String iban;
    
    @Column(name = "account_number")
    private String accountNumber;
    
    @Column(name = "branch_code")
    private String branchCode;
    
    // Sanal Pos Ayarları (PayTR, iyzico, Stripe vb.)
    @Column(name = "payment_gateway")
    @Enumerated(EnumType.STRING)
    private PaymentGateway paymentGateway = PaymentGateway.NONE;
    
    @Column(name = "merchant_id")
    private String merchantId; // Mağaza ID
    
    @Column(name = "merchant_key")
    private String merchantKey; // Mağaza anahtarı (şifreli saklanmalı)
    
    @Column(name = "merchant_salt")
    private String merchantSalt; // Salt değeri
    
    @Column(name = "api_key")
    private String apiKey; // API anahtarı
    
    @Column(name = "secret_key")
    private String secretKey; // Gizli anahtar (şifreli saklanmalı)
    
    @Column(name = "is_test_mode")
    private Boolean isTestMode = true; // Test modu aktif mi
    
    @Column(name = "is_active")
    private Boolean isActive = false; // Ödeme aktif mi
    
    @Column(name = "allow_installments")
    private Boolean allowInstallments = false; // Taksit seçeneği
    
    @Column(name = "max_installment_count")
    private Integer maxInstallmentCount = 6; // Maksimum taksit sayısı
    
    @Column(name = "min_installment_amount")
    private Double minInstallmentAmount = 100.0; // Minimum taksit tutarı
    
    @Column(name = "installment_commission_rates")
    private String installmentCommissionRates; // JSON formatında taksit komisyon oranları
    
    @Column(name = "supported_cards")
    private String supportedCards; // Desteklenen kartlar (Visa, MasterCard vb.)
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PaymentGateway {
        NONE,        // Ödeme yok - sadece havale
        PAYTR,       // PayTR
        IYZICO,      // iyzico
        STRIPE,      // Stripe
        BRAINTREE,   // Braintree
        PAYPAL,      // PayPal
        PAYU         // PayU
    }
}
