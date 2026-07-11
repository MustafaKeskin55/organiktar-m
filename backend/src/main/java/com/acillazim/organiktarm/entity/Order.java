package com.acillazim.organiktarm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_number", unique = true)
    private String orderNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OrderItem> items = new ArrayList<>();
    
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;
    
    @Column(name = "delivery_fee")
    private Double deliveryFee = 0.0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.BEKLEMEDE;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    @JsonIgnore
    private Address address;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "estimated_delivery")
    private LocalDate estimatedDelivery;
    
    @PrePersist
    public void prePersist() {
        if (orderNumber == null) {
            orderNumber = "ORD-" + System.currentTimeMillis();
        }
        if (estimatedDelivery == null) {
            estimatedDelivery = LocalDate.now().plusDays(3);
        }
    }
    
    public enum OrderStatus {
        BEKLEMEDE, ONAYLANDI, HAZIRLANIYOR, YOLDA, TESLIM_EDILDI, IPTAL_EDILDI
    }
    
    public enum PaymentMethod {
        CARD, TRANSFER, COD
    }
}
