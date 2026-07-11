package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.SiteContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteContentRepository extends JpaRepository<SiteContent, Long> {
    
    Optional<SiteContent> findByContentKey(String contentKey);
    
    List<SiteContent> findByContentTypeAndIsActiveTrueOrderByDisplayOrderAsc(String contentType);
    
    List<SiteContent> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    boolean existsByContentKey(String contentKey);
}
