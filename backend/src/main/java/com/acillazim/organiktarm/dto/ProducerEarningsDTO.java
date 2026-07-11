package com.acillazim.organiktarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProducerEarningsDTO {
    
    private Long producerId;
    private String producerName;
    
    // Komisyon oranı (%)
    private BigDecimal commissionRate;
    
    // Toplam satış istatistikleri
    private Integer totalOrders;
    private Integer completedOrders;
    private Integer cancelledOrders;
    private Integer pendingOrders;
    
    // Finansal özet
    private BigDecimal grossRevenue;      // Brüt kazanç (komisyon öncesi)
    private BigDecimal totalCommission;   // Toplam komisyon kesintisi
    private BigDecimal netRevenue;        // Net kazanç (komisyon sonrası)
    private BigDecimal shippingRevenue;  // Kargo geliri (varsa)
    
    // Aylık kazanç grafiği verisi
    private List<MonthlyEarning> monthlyEarnings;
    
    // Ürün bazlı kazanç (top 5)
    private List<ProductEarning> topProducts;
    
    // Ödeme durumu
    private BigDecimal pendingPayment;    // Bekleyen ödeme
    private BigDecimal lastPayment;         // Son yapılan ödeme
    private String lastPaymentDate;       // Son ödeme tarihi
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyEarning {
        private String month;           // "Ocak 2026", "Şubat 2026", vb.
        private Integer year;
        private Integer monthValue;     // 1-12
        private BigDecimal grossRevenue;
        private BigDecimal commission;
        private BigDecimal netRevenue;
        private Integer orderCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductEarning {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantitySold;
        private BigDecimal grossRevenue;
        private BigDecimal commission;
        private BigDecimal netRevenue;
    }
}
