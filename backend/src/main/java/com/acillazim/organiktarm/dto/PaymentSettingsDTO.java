package com.acillazim.organiktarm.dto;

import lombok.Data;

@Data
public class PaymentSettingsDTO {
    private Long id;
    
    // IBAN Bilgileri
    private String bankName;
    private String accountHolder;
    private String iban;
    private String accountNumber;
    private String branchCode;
    
    // Sanal Pos
    private String paymentGateway; // Enum as String
    private String merchantId;
    private String merchantKey;
    private Boolean isTestMode;
    private Boolean isActive;
    private Boolean allowInstallments;
    private Integer maxInstallmentCount;
    private Double minInstallmentAmount;
    private String supportedCards;
    
    // Masked API bilgileri (güvenlik için)
    private String apiKeyMasked; // sadece son 4 karakter gösterilir
    private String secretKeyMasked;
    
    private String createdAt;
    private String updatedAt;
}
