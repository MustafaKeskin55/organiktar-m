package com.acillazim.organiktarm.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FinancialReportDTO {
    private Long id;
    private String reportDate;
    private String reportType; // Enum as String
    private Integer totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalCommission;
    private BigDecimal netRevenue;
    private BigDecimal totalShipping;
    private BigDecimal totalTax;
    private Integer cancelledOrders;
    private BigDecimal cancelledAmount;
    private BigDecimal refundedAmount;
    private Integer newUsers;
    private Integer newProducers;
    private Integer newProducts;
    private String topSellingCategory;
    private BigDecimal avgOrderValue;
    private BigDecimal conversionRate;
    private String createdAt;
}
