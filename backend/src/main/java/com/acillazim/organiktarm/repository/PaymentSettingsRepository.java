package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.PaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentSettingsRepository extends JpaRepository<PaymentSettings, Long> {
    
    // Aktif ödeme yöntemini getir
    Optional<PaymentSettings> findByIsActiveTrue();
    
    // Tüm aktif ödeme yöntemlerini getir
    List<PaymentSettings> findAllByIsActiveTrue();
}
