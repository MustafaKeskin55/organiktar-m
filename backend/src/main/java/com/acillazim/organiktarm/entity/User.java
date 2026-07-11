package com.acillazim.organiktarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType type;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // Default: active
    
    @Column(name = "force_password_change")
    private Boolean forcePasswordChange = false; // Geçici şifre ile giriş sonrası şifre değiştirme zorunluluğu
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "user_favorites", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "product_id")
    private List<Long> favorites = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Kullanici bazli komisyon orani (NULL ise varsayilan kullanilir)
    @Column(name = "commission_rate")
    private Double commissionRate;
    
    // Son giris tarihi
    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;
    
    // Toplam giris sayisi
    @Column(name = "login_count")
    private Integer loginCount = 0;
    
    // Kayit tarihi
    @Column(name = "registration_date")
    private LocalDateTime registrationDate;
    
    public enum UserType {
        // Tüketiciler ve Üreticiler
        CONSUMER, PRODUCER,
        // Yönetici Roller (3 seviye)
        SUPER_ADMIN,    // Tam yetki
        MANAGER,        // Sadece okuma
        FINANCE         // Mali işlemler
    }
}
