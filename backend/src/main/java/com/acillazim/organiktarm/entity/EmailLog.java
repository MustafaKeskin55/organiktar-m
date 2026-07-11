package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "template_type", nullable = false, length = 50)
    private String templateType;
    
    @Column(nullable = false)
    private String subject;
    
    @CreationTimestamp
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(length = 20)
    private String status = "SUCCESS"; // SUCCESS, FAILED
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "opened_at")
    private LocalDateTime openedAt; // E-posta acilma tarihi (tracking)
}