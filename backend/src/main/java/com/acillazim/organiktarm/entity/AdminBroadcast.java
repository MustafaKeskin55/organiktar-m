package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admin_broadcasts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminBroadcast {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "broadcast_type", length = 50)
    private BroadcastType broadcastType = BroadcastType.ALL;
    
    @Column(name = "target_filter", columnDefinition = "TEXT")
    private String targetFilter;
    
    @Column(name = "sent_count")
    private Integer sentCount = 0;
    
    @Column(name = "read_count")
    private Integer readCount = 0;
    
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.DRAFT;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "broadcast", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdminBroadcastRecipient> recipients = new ArrayList<>();
    
    public enum BroadcastType {
        ALL, CONSUMERS, PRODUCERS, SPECIFIC_USERS
    }
    
    public enum Status {
        DRAFT, SCHEDULED, SENDING, SENT, FAILED
    }
}