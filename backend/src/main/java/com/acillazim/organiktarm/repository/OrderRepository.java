package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT o FROM Order o JOIN o.items oi WHERE oi.product.producer.id = :producerId ORDER BY o.createdAt DESC")
    List<Order> findByProducerId(@Param("producerId") Long producerId);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    long countByStatus(Order.OrderStatus status);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'TESLIM_EDILDI'")
    Double sumTotalRevenue();
    
    // For FinancialReportService
    List<Order> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    // User engagement tracking
    int countByUserId(Long userId);
    
    java.util.Optional<Order> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
