package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(length = 255)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;
    
    private Integer usageLimit;
    
    @Column(nullable = false)
    private Integer usageCount = 0;
    
    @Column(nullable = false)
    private Integer perUserLimit = 1;
    
    @Column(nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private LocalDateTime endDate;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "coupon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CouponCategory> categories = new ArrayList<>();
    
    @OneToMany(mappedBy = "coupon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CouponProduct> products = new ArrayList<>();
    
    @OneToMany(mappedBy = "coupon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CouponUser> specificUsers = new ArrayList<>();
    
    public enum DiscountType {
        PERCENTAGE, // Yuzde indirim (0-100)
        FIXED       // Sabit tutar indirim (TL)
    }
    
    // Kupon gecerli mi kontrolu
    public boolean isValid() {
        if (!isActive) return false;
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startDate) || now.isAfter(endDate)) return false;
        
        if (usageLimit != null && usageCount >= usageLimit) return false;
        
        return true;
    }
    
    // Indirim hesaplama
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValid()) return BigDecimal.ZERO;
        
        // Minimum siparis tutari kontrolu
        if (orderAmount.compareTo(minOrderAmount) < 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal discount;
        
        if (discountType == DiscountType.PERCENTAGE) {
            // Yuzdelik indirim
            discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
            // Maksimum indirim limiti varsa uygula
            if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                discount = maxDiscountAmount;
            }
        } else {
            // Sabit tutar indirim
            discount = discountValue;
        }
        
        // Indirim siparis tutarindan fazla olamaz
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }
        
        return discount;
    }
}