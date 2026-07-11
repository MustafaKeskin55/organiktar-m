package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "site_content")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteContent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String contentKey; // "hero_stats", "how_it_works", "testimonials", "subscription_plans"
    
    @Column(name = "content_type", nullable = false)
    private String contentType; // "HERO", "STEPS", "TESTIMONIALS", "PLANS", "CHATBOT"
    
    @Column(columnDefinition = "TEXT")
    private String contentData; // JSON formatında içerik
    
    @Column
    private Boolean isActive = true;
    
    @Column
    private Integer displayOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
