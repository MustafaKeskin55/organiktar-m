package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.SiteSettingsDTO;
import com.acillazim.organiktarm.entity.SiteSettings;
import com.acillazim.organiktarm.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {
    
    private final SiteSettingsRepository siteSettingsRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    
    @Transactional(readOnly = true)
    public SiteSettingsDTO getSettings() {
        SiteSettings settings = siteSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
        return convertToDTO(settings);
    }
    
    @Transactional
    public SiteSettingsDTO updateSettings(SiteSettingsDTO dto) {
        SiteSettings settings = siteSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
        
        // Güncelle
        settings.setSiteName(dto.getSiteName());
        settings.setSiteDescription(dto.getSiteDescription());
        settings.setContactEmail(dto.getContactEmail());
        settings.setContactPhone(dto.getContactPhone());
        settings.setCommissionRate(dto.getCommissionRate());
        settings.setMinOrderAmount(dto.getMinOrderAmount());
        settings.setFreeShippingThreshold(dto.getFreeShippingThreshold());
        settings.setShippingFee(dto.getShippingFee());
        settings.setTaxRate(dto.getTaxRate());
        settings.setMaintenanceMode(dto.getMaintenanceMode());
        settings.setAllowRegistration(dto.getAllowRegistration());
        settings.setRequireApprovalForProducts(dto.getRequireApprovalForProducts());
        settings.setAutoApproveProducers(dto.getAutoApproveProducers());
        settings.setCurrency(dto.getCurrency());
        settings.setLanguage(dto.getLanguage());
        settings.setTimezone(dto.getTimezone());
        
        SiteSettings saved = siteSettingsRepository.save(settings);
        return convertToDTO(saved);
    }
    
    @Transactional
    public SiteSettingsDTO updateCommissionRate(java.math.BigDecimal rate) {
        SiteSettings settings = siteSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::createDefaultSettings);
        settings.setCommissionRate(rate);
        SiteSettings saved = siteSettingsRepository.save(settings);
        return convertToDTO(saved);
    }
    
    private SiteSettings createDefaultSettings() {
        SiteSettings settings = new SiteSettings();
        return siteSettingsRepository.save(settings);
    }
    
    private SiteSettingsDTO convertToDTO(SiteSettings settings) {
        SiteSettingsDTO dto = new SiteSettingsDTO();
        dto.setId(settings.getId());
        dto.setSiteName(settings.getSiteName());
        dto.setSiteDescription(settings.getSiteDescription());
        dto.setContactEmail(settings.getContactEmail());
        dto.setContactPhone(settings.getContactPhone());
        dto.setCommissionRate(settings.getCommissionRate());
        dto.setMinOrderAmount(settings.getMinOrderAmount());
        dto.setFreeShippingThreshold(settings.getFreeShippingThreshold());
        dto.setShippingFee(settings.getShippingFee());
        dto.setTaxRate(settings.getTaxRate());
        dto.setMaintenanceMode(settings.getMaintenanceMode());
        dto.setAllowRegistration(settings.getAllowRegistration());
        dto.setRequireApprovalForProducts(settings.getRequireApprovalForProducts());
        dto.setAutoApproveProducers(settings.getAutoApproveProducers());
        dto.setCurrency(settings.getCurrency());
        dto.setLanguage(settings.getLanguage());
        dto.setTimezone(settings.getTimezone());
        if (settings.getCreatedAt() != null) {
            dto.setCreatedAt(settings.getCreatedAt().format(formatter));
        }
        if (settings.getUpdatedAt() != null) {
            dto.setUpdatedAt(settings.getUpdatedAt().format(formatter));
        }
        return dto;
    }
}
