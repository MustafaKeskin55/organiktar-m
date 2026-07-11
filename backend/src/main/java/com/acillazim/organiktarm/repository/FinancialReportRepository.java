package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.FinancialReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialReportRepository extends JpaRepository<FinancialReport, Long> {
    
    // Tarihe göre rapor getir
    Optional<FinancialReport> findByReportDateAndReportType(LocalDate reportDate, FinancialReport.ReportType reportType);
    
    // Aylık raporlar getir
    List<FinancialReport> findByReportTypeOrderByReportDateDesc(FinancialReport.ReportType reportType);
    
    // Tarih aralığında raporlar getir
    List<FinancialReport> findByReportDateBetweenOrderByReportDateDesc(LocalDate startDate, LocalDate endDate);
    
    // Son N günlük rapor
    @Query("SELECT fr FROM FinancialReport fr WHERE fr.reportType = 'DAILY' ORDER BY fr.reportDate DESC LIMIT :limit")
    List<FinancialReport> findLastNDailyReports(@Param("limit") int limit);
    
    // Toplam gelir getir
    @Query("SELECT SUM(fr.totalRevenue) FROM FinancialReport fr WHERE fr.reportDate BETWEEN :startDate AND :endDate")
    Double calculateTotalRevenue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Toplam komisyon getir
    @Query("SELECT SUM(fr.totalCommission) FROM FinancialReport fr WHERE fr.reportDate BETWEEN :startDate AND :endDate")
    Double calculateTotalCommission(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Yıllık özet
    @Query("SELECT fr FROM FinancialReport fr WHERE fr.reportType = 'YEARLY' AND YEAR(fr.reportDate) = :year")
    Optional<FinancialReport> findYearlyReport(@Param("year") int year);
}
