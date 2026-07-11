package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_emails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledEmail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false, length = 50)
    private EmailType emailType; // WELCOME, ANNIVERSARY, INACTIVE, BIRTHDAY vb.
    
    @Column(name = "scheduled_date", nullable = false)
    private LocalDateTime scheduledDate;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.PENDING;
    
    @Column(name = "sent_date")
    private LocalDateTime sentDate;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // Enum definitions
    public enum Status {
        PENDING, SENT, FAILED
    }
    
    public enum EmailType {
        WELCOME, ANNIVERSARY, INACTIVE, BIRTHDAY, PROMOTION, CUSTOM
    }
    
    // Legacy getter/setter for templateType
    public String getTemplateType() {
        return emailType != null ? emailType.name() : null;
    }
    
    public void setTemplateType(String templateType) {
        if (templateType != null) {
            this.emailType = EmailType.valueOf(templateType);
        }
    }
    
    // Getter/Setter for emailType
    public EmailType getEmailType() {
        return emailType;
    }
    
    public void setEmailType(EmailType emailType) {
        this.emailType = emailType;
    }
    
    // Helper method for sentAt (alias for sentDate)
    public void setSentAt(LocalDateTime sentAt) {
        this.sentDate = sentAt;
    }
    
    public LocalDateTime getSentAt() {
        return sentDate;
    }
}