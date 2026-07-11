package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
    
    // İlk kaydı getir (tek kayıt olmalı)
    Optional<SiteSettings> findFirstByOrderByIdAsc();
}
