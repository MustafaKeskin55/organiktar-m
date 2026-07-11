package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "template_key", nullable = false, unique = true, length = 50)
    private String templateKey;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(name = "content_html", nullable = false, columnDefinition = "TEXT")
    private String contentHtml;
    
    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}