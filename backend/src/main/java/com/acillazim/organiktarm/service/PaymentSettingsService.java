package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.PaymentSettingsDTO;
import com.acillazim.organiktarm.entity.PaymentSettings;
import com.acillazim.organiktarm.repository.PaymentSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentSettingsService {
    
    private final PaymentSettingsRepository paymentSettingsRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    
    @Transactional(readOnly = true)
    public List<PaymentSettingsDTO> getAllPaymentSettings() {
        return paymentSettingsRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PaymentSettingsDTO getActivePaymentSettings() {
        PaymentSettings settings = paymentSettingsRepository.findByIsActiveTrue()
                .orElseGet(this::createDefaultPaymentSettings);
        return convertToDTO(settings);
    }
    
    @Transactional
    public @NonNull PaymentSettingsDTO savePaymentSettings(@NonNull PaymentSettingsDTO dto) {
        PaymentSettings settings;
        
        Long dtoId = dto.getId();
        if (dtoId != null) {
            settings = paymentSettingsRepository.findById(dtoId)
                    .orElse(new PaymentSettings());
        } else {
            settings = new PaymentSettings();
        }
        
        // IBAN Bilgileri
        settings.setBankName(dto.getBankName());
        settings.setAccountHolder(dto.getAccountHolder());
        settings.setIban(dto.getIban());
        settings.setAccountNumber(dto.getAccountNumber());
        settings.setBranchCode(dto.getBranchCode());
        
        // Sanal Pos Ayarları
        settings.setPaymentGateway(PaymentSettings.PaymentGateway.valueOf(dto.getPaymentGateway()));
        settings.setMerchantId(dto.getMerchantId());
        if (dto.getMerchantKey() != null && !dto.getMerchantKey().isEmpty()) {
            settings.setMerchantKey(dto.getMerchantKey());
        }
        settings.setIsTestMode(dto.getIsTestMode());
        settings.setIsActive(dto.getIsActive());
        settings.setAllowInstallments(dto.getAllowInstallments());
        settings.setMaxInstallmentCount(dto.getMaxInstallmentCount());
        settings.setMinInstallmentAmount(dto.getMinInstallmentAmount());
        settings.setSupportedCards(dto.getSupportedCards());
        
        return java.util.Objects.requireNonNull(convertToDTO(paymentSettingsRepository.save(settings)));
    }
    
    @Transactional
    public @NonNull PaymentSettingsDTO updateIbanInfo(@NonNull String bankName, @NonNull String accountHolder, @NonNull String iban) {
        PaymentSettings settings = paymentSettingsRepository.findAll().stream()
                .findFirst()
                .orElseGet(this::createDefaultPaymentSettings);
        
        settings.setBankName(bankName);
        settings.setAccountHolder(accountHolder);
        settings.setIban(iban);
        
        return java.util.Objects.requireNonNull(convertToDTO(paymentSettingsRepository.save(settings)));
    }
    
    @Transactional
    public void deletePaymentSettings(@NonNull Long id) {
        paymentSettingsRepository.deleteById(id);
    }
    
    private PaymentSettings createDefaultPaymentSettings() {
        PaymentSettings settings = new PaymentSettings();
        settings.setPaymentGateway(PaymentSettings.PaymentGateway.NONE);
        settings.setIsActive(true);
        return paymentSettingsRepository.save(settings);
    }
    
    private PaymentSettingsDTO convertToDTO(PaymentSettings settings) {
        PaymentSettingsDTO dto = new PaymentSettingsDTO();
        dto.setId(settings.getId());
        dto.setBankName(settings.getBankName());
        dto.setAccountHolder(settings.getAccountHolder());
        dto.setIban(settings.getIban());
        dto.setAccountNumber(settings.getAccountNumber());
        dto.setBranchCode(settings.getBranchCode());
        dto.setPaymentGateway(settings.getPaymentGateway().name());
        dto.setMerchantId(settings.getMerchantId());
        dto.setIsTestMode(settings.getIsTestMode());
        dto.setIsActive(settings.getIsActive());
        dto.setAllowInstallments(settings.getAllowInstallments());
        dto.setMaxInstallmentCount(settings.getMaxInstallmentCount());
        dto.setMinInstallmentAmount(settings.getMinInstallmentAmount());
        dto.setSupportedCards(settings.getSupportedCards());
        
        // Güvenlik için API anahtarlarını maskele
        if (settings.getApiKey() != null && settings.getApiKey().length() > 4) {
            dto.setApiKeyMasked("****" + settings.getApiKey().substring(settings.getApiKey().length() - 4));
        }
        if (settings.getSecretKey() != null && settings.getSecretKey().length() > 4) {
            dto.setSecretKeyMasked("****" + settings.getSecretKey().substring(settings.getSecretKey().length() - 4));
        }
        
        if (settings.getCreatedAt() != null) {
            dto.setCreatedAt(settings.getCreatedAt().format(formatter));
        }
        if (settings.getUpdatedAt() != null) {
            dto.setUpdatedAt(settings.getUpdatedAt().format(formatter));
        }
        
        return dto;
    }
}
