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
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;
    
    @Column(length = 255)
    private String subject;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private MessageType messageType = MessageType.GENERAL;
    
    @Column(name = "related_order_id")
    private Long relatedOrderId;
    
    @Column(name = "related_product_id")
    private Long relatedProductId;
    
    @Column(name = "parent_message_id")
    private Long parentMessageId;
    
    @Column(nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "is_deleted_by_sender")
    private Boolean isDeletedBySender = false;
    
    @Column(name = "is_deleted_by_receiver")
    private Boolean isDeletedByReceiver = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MessageAttachment> attachments = new ArrayList<>();
    
    public enum MessageType {
        GENERAL,    // Genel mesaj
        ORDER,      // Siparis ile ilgili
        PRODUCT,    // Urun ile ilgili
        COMPLAINT,  // Sikayet
        SUPPORT,    // Destek talebi
        REPLY       // Yanıt mesajı
    }
    
    // Helper methods for backward compatibility
    
    /**
     * Alias for setIsRead - used by service layer
     */
    public void setRead(boolean read) {
        this.isRead = read;
    }
    
    /**
     * Alias for isIsRead - used by service layer
     */
    public boolean isRead() {
        return this.isRead != null ? this.isRead : false;
    }
    
    /**
     * Set parent message by Message entity
     */
    public void setParentMessage(Message parentMessage) {
        if (parentMessage != null) {
            this.parentMessageId = parentMessage.getId();
        } else {
            this.parentMessageId = null;
        }
    }
    
    /**
     * Get parent message (this is a placeholder - actual implementation would fetch from DB)
     */
    public Message getParentMessage() {
        // This returns null as we don't store the full Message object
        // The service should fetch from repository using parentMessageId
        return null;
    }
}