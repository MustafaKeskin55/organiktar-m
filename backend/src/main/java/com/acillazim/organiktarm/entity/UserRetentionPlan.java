package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_retention_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRetentionPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "plan_type", nullable = false, length = 50)
    private String planType; // INACTIVE, LOW_ENGAGEMENT, CHURN_RISK vb.
    
    @Column(name = "ai_generated_plan", nullable = false, columnDefinition = "TEXT")
    private String aiGeneratedPlan; // AI tarafindan uretilen plan
    
    @Column(name = "suggested_actions", columnDefinition = "TEXT")
    private String suggestedActions; // Onerilen aksiyonlar
    
    @Column(name = "discount_code", length = 50)
    private String discountCode;
    
    @Column(name = "discount_percentage")
    private Double discountPercentage;
    
    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, APPLIED, EXPIRED
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
    
    // PlanType enum
    public enum PlanType {
        INACTIVE,           // Inaktif kullanıcılar için
        LOW_ENGAGEMENT,     // Düşük etkileşim
        CHURN_RISK,         // Ayrılma riski
        HIGH_VALUE,         // Yüksek değerli müşteri
        ANNIVERSARY         // Yıldönümü
    }
    
    // Getter/Setter for PlanType
    public PlanType getPlanType() {
        return planType != null ? PlanType.valueOf(planType) : null;
    }
    
    public void setPlanType(PlanType planType) {
        this.planType = planType != null ? planType.name() : null;
    }
    
    // Legacy setter for string plan type
    public void setPlanType(String planType) {
        this.planType = planType;
    }
    
    // Description getter/setter
    public String getDescription() {
        return aiGeneratedPlan;
    }
    
    public void setDescription(String description) {
        this.aiGeneratedPlan = description;
    }
    
    // Executed getter/setter - maps to status
    public boolean isExecuted() {
        return "APPLIED".equals(status);
    }
    
    public void setExecuted(boolean executed) {
        this.status = executed ? "APPLIED" : "ACTIVE";
    }
}