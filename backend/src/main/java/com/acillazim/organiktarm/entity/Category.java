package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String slug; // "sebze", "meyve", vb.
    
    @Column(nullable = false)
    private String name; // "Sebze", "Meyve", vb.
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "image_url", length = 1000)
    private String imageUrl; // Kategori görseli URL
    
    @Column(name = "icon_name")
    private String iconName; // Lucide icon ismi (isteğe bağlı)
    
    @Column(name = "display_order")
    private Integer displayOrder = 0; // Sıralama
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "product_count")
    private Integer productCount = 0; // Ürün sayısı (güncellenmeli)
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
