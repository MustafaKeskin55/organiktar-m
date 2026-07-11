package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate; // Rapor tarihi (günlük, aylık, yıllık)
    
    @Column(name = "report_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReportType reportType; // Günlük, haftalık, aylık, yıllık
    
    @Column(name = "total_orders")
    private Integer totalOrders = 0; // Toplam sipariş sayısı
    
    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO; // Toplam gelir
    
    @Column(name = "total_commission", precision = 15, scale = 2)
    private BigDecimal totalCommission = BigDecimal.ZERO; // Toplam komisyon
    
    @Column(name = "net_revenue", precision = 15, scale = 2)
    private BigDecimal netRevenue = BigDecimal.ZERO; // Net gelir (komisyon düşülmüş)
    
    @Column(name = "total_shipping", precision = 15, scale = 2)
    private BigDecimal totalShipping = BigDecimal.ZERO; // Toplam kargo ücreti
    
    @Column(name = "total_tax", precision = 15, scale = 2)
    private BigDecimal totalTax = BigDecimal.ZERO; // Toplam KDV
    
    @Column(name = "cancelled_orders")
    private Integer cancelledOrders = 0; // İptal edilen sipariş sayısı
    
    @Column(name = "cancelled_amount", precision = 15, scale = 2)
    private BigDecimal cancelledAmount = BigDecimal.ZERO; // İptal edilen tutar
    
    @Column(name = "refunded_amount", precision = 15, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO; // İade edilen tutar
    
    @Column(name = "new_users")
    private Integer newUsers = 0; // Yeni kullanıcı sayısı
    
    @Column(name = "new_producers")
    private Integer newProducers = 0; // Yeni üretici sayısı
    
    @Column(name = "new_products")
    private Integer newProducts = 0; // Yeni ürün sayısı
    
    @Column(name = "top_selling_category")
    private String topSellingCategory; // En çok satan kategori
    
    @Column(name = "avg_order_value", precision = 10, scale = 2)
    private BigDecimal avgOrderValue = BigDecimal.ZERO; // Ortalama sipariş tutarı
    
    @Column(name = "conversion_rate", precision = 5, scale = 2)
    private BigDecimal conversionRate = BigDecimal.ZERO; // Dönüşüm oranı
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum ReportType {
        DAILY,      // Günlük
        WEEKLY,     // Haftalık
        MONTHLY,    // Aylık
        QUARTERLY,  // 3 aylık
        YEARLY      // Yıllık
    }
    
    // Revenue Summary inner class for dashboard stats
    public static class RevenueSummary {
        public BigDecimal totalRevenue;
        public BigDecimal totalCommission;
        public BigDecimal netRevenue;
        public BigDecimal totalShipping;
        public int totalOrders;
        public int cancelledOrders;
        public BigDecimal avgOrderValue;
        
        public RevenueSummary(BigDecimal totalRevenue, BigDecimal totalCommission, BigDecimal netRevenue,
                             BigDecimal totalShipping, int totalOrders, int cancelledOrders, BigDecimal avgOrderValue) {
            this.totalRevenue = totalRevenue;
            this.totalCommission = totalCommission;
            this.netRevenue = netRevenue;
            this.totalShipping = totalShipping;
            this.totalOrders = totalOrders;
            this.cancelledOrders = cancelledOrders;
            this.avgOrderValue = avgOrderValue;
        }
    }
}
