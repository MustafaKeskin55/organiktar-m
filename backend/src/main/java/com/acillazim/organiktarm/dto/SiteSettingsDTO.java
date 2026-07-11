package com.acillazim.organiktarm.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SiteSettingsDTO {
    private Long id;
    private String siteName;
    private String siteDescription;
    private String contactEmail;
    private String contactPhone;
    private BigDecimal commissionRate;
    private BigDecimal minOrderAmount;
    private BigDecimal freeShippingThreshold;
    private BigDecimal shippingFee;
    private BigDecimal taxRate;
    private Boolean maintenanceMode;
    private Boolean allowRegistration;
    private Boolean requireApprovalForProducts;
    private Boolean autoApproveProducers;
    private String currency;
    private String language;
    private String timezone;
    private String createdAt;
    private String updatedAt;
}
