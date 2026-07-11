package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCode(String code);
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.startDate <= :now AND c.endDate >= :now")
    List<Coupon> findActiveCoupons(@Param("now") LocalDateTime now);
    
    @Query("SELECT c FROM Coupon c WHERE c.createdBy = :adminId")
    List<Coupon> findByCreatedBy(@Param("adminId") Long adminId);
    
    boolean existsByCode(String code);
}