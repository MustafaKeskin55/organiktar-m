package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.FinancialReportDTO;
import com.acillazim.organiktarm.entity.FinancialReport;
import com.acillazim.organiktarm.entity.Order;
import com.acillazim.organiktarm.repository.FinancialReportRepository;
import com.acillazim.organiktarm.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialReportService {
    
    private final FinancialReportRepository financialReportRepository;
    private final OrderRepository orderRepository;
    private final SiteSettingsService siteSettingsService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_DATE;
    
    @Transactional(readOnly = true)
    public List<FinancialReportDTO> getDailyReports(int limit) {
        return financialReportRepository.findLastNDailyReports(limit).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FinancialReportDTO> getMonthlyReports() {
        return financialReportRepository.findByReportTypeOrderByReportDateDesc(FinancialReport.ReportType.MONTHLY)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public FinancialReportDTO getDashboardStats() {
        // Bugünün raporunu getir veya oluştur
        LocalDate today = LocalDate.now();
        FinancialReport report = financialReportRepository
                .findByReportDateAndReportType(today, FinancialReport.ReportType.DAILY)
                .orElseGet(() -> generateDailyReport(today));
        
        return convertToDTO(report);
    }
    
    @Transactional(readOnly = true)
    public FinancialReport.RevenueSummary getRevenueSummary(LocalDate startDate, LocalDate endDate) {
        List<Order> orders = orderRepository.findByCreatedAtBetween(startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalShipping = BigDecimal.ZERO;
        int totalOrders = 0;
        int cancelledOrders = 0;
        
        BigDecimal commissionRate = siteSettingsService.getSettings().getCommissionRate()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        
        for (Order order : orders) {
            if (order.getStatus() == Order.OrderStatus.IPTAL_EDILDI) {
                cancelledOrders++;
            } else if (order.getStatus() == Order.OrderStatus.TESLIM_EDILDI || order.getStatus() == Order.OrderStatus.ONAYLANDI) {
                totalOrders++;
                BigDecimal orderTotal = BigDecimal.valueOf(order.getTotalAmount());
                totalRevenue = totalRevenue.add(orderTotal);
                totalCommission = totalCommission.add(orderTotal.multiply(commissionRate));
                totalShipping = totalShipping.add(BigDecimal.valueOf(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0));
            }
        }
        
        BigDecimal netRevenue = totalRevenue.subtract(totalCommission);
        BigDecimal avgOrderValue = totalOrders > 0 ? totalRevenue.divide(new BigDecimal(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        return new FinancialReport.RevenueSummary(totalRevenue, totalCommission, netRevenue, totalShipping, totalOrders, cancelledOrders, avgOrderValue);
    }
    
    @Transactional
    public FinancialReport generateDailyReport(LocalDate date) {
        FinancialReport report = new FinancialReport();
        report.setReportDate(date);
        report.setReportType(FinancialReport.ReportType.DAILY);
        
        // Siparişleri getir
        List<Order> orders = orderRepository.findByCreatedAtBetween(
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay()
        );
        
        BigDecimal commissionRate = siteSettingsService.getSettings().getCommissionRate()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalShipping = BigDecimal.ZERO;
        int totalOrders = 0;
        int cancelledOrders = 0;
        
        for (Order order : orders) {
            if (order.getStatus() == Order.OrderStatus.IPTAL_EDILDI) {
                cancelledOrders++;
            } else {
                totalOrders++;
                BigDecimal orderTotal = BigDecimal.valueOf(order.getTotalAmount());
                totalRevenue = totalRevenue.add(orderTotal);
                totalCommission = totalCommission.add(orderTotal.multiply(commissionRate));
                totalShipping = totalShipping.add(BigDecimal.valueOf(order.getDeliveryFee() != null ? order.getDeliveryFee() : 0));
            }
        }
        
        report.setTotalOrders(totalOrders);
        report.setTotalRevenue(totalRevenue);
        report.setTotalCommission(totalCommission);
        report.setNetRevenue(totalRevenue.subtract(totalCommission));
        report.setTotalShipping(totalShipping);
        report.setCancelledOrders(cancelledOrders);
        report.setAvgOrderValue(totalOrders > 0 ? totalRevenue.divide(new BigDecimal(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        return financialReportRepository.save(report);
    }
    
    private FinancialReportDTO convertToDTO(FinancialReport report) {
        FinancialReportDTO dto = new FinancialReportDTO();
        dto.setId(report.getId());
        dto.setReportDate(report.getReportDate().format(dateFormatter));
        dto.setReportType(report.getReportType().name());
        dto.setTotalOrders(report.getTotalOrders());
        dto.setTotalRevenue(report.getTotalRevenue());
        dto.setTotalCommission(report.getTotalCommission());
        dto.setNetRevenue(report.getNetRevenue());
        dto.setTotalShipping(report.getTotalShipping());
        dto.setTotalTax(report.getTotalTax());
        dto.setCancelledOrders(report.getCancelledOrders());
        dto.setCancelledAmount(report.getCancelledAmount());
        dto.setRefundedAmount(report.getRefundedAmount());
        dto.setNewUsers(report.getNewUsers());
        dto.setNewProducers(report.getNewProducers());
        dto.setNewProducts(report.getNewProducts());
        dto.setTopSellingCategory(report.getTopSellingCategory());
        dto.setAvgOrderValue(report.getAvgOrderValue());
        dto.setConversionRate(report.getConversionRate());
        if (report.getCreatedAt() != null) {
            dto.setCreatedAt(report.getCreatedAt().format(formatter));
        }
        return dto;
    }
    
}
