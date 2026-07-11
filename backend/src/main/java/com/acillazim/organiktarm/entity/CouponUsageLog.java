package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usage_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponUsageLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(name = "discount_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal discountAmount;
    
    @Column(name = "original_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal originalAmount;
    
    @Column(name = "final_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal finalAmount;
    
    @CreationTimestamp
    @Column(name = "used_at")
    private LocalDateTime usedAt;
}