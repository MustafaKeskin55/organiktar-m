package com.acillazim.organiktarm.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponCreateRequest {
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer perUserLimit;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
