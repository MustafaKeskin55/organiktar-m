package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.UserDTO;
import com.acillazim.organiktarm.entity.User;
import com.acillazim.organiktarm.repository.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public UserDTO getUserById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + id));
        return convertToDTO(user);
    }
    
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(@NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + email));
        return convertToDTO(user);
    }
    
    @Transactional
    public UserDTO createUser(@NonNull UserDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanımda");
        }
        
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setType(User.UserType.valueOf(dto.getType().toUpperCase()));
        
        User saved = userRepository.save(user);
        return convertToDTO(saved);
    }
    
    @Transactional
    public UserDTO updateUser(@NonNull Long id, @NonNull UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + id));
        
        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        
        User updated = userRepository.save(user);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteUser(@NonNull Long id) {
        userRepository.deleteById(id);
    }
    
    public long countUsers() {
        return userRepository.count();
    }
    
    public long countByType(String type) {
        return userRepository.countByType(User.UserType.valueOf(type.toUpperCase()));
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        // İngilizce locale kullanarak lowercase yap (Türkçe "ı" sorunu olmaması için)
        dto.setType(user.getType().name().toLowerCase(Locale.ENGLISH));
        dto.setIsActive(user.getIsActive() != null ? user.getIsActive() : true);
        dto.setForcePasswordChange(user.getForcePasswordChange() != null ? user.getForcePasswordChange() : false);
        dto.setCreatedAt(user.getCreatedAt());
        
        // Engagement & Commission fields
        dto.setCommissionRate(user.getCommissionRate());
        dto.setLastLoginDate(user.getLastLoginDate());
        dto.setLoginCount(user.getLoginCount());
        dto.setRegistrationDate(user.getRegistrationDate() != null ? user.getRegistrationDate() : user.getCreatedAt());
        
        return dto;
    }
    
    // ==================== SUPER ADMIN METHODS ====================
    
    @Transactional
    public UserDTO toggleUserActiveStatus(@NonNull Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + id));
        
        user.setIsActive(active);
        User updated = userRepository.save(user);
        
        return convertToDTO(updated);
    }
    
    @Transactional
    public String resetUserPassword(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + id));
        
        // Generate temporary password
        String tempPassword = generateTempPassword();
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setForcePasswordChange(true); // İlk girişte şifre değiştirme zorunluluğu
        userRepository.save(user);
        
        // Send password reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), tempPassword);
        } catch (Exception e) {
            // Email sending failed but password was reset - still return temp password
            System.out.println("Sifre sifirlandi ancak e-posta gonderilemedi: " + e.getMessage());
        }
        
        return tempPassword;
    }
    
    @Transactional
    public UserDTO updateUserRole(@NonNull Long id, @NonNull String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + id));
        
        try {
            User.UserType newRole = User.UserType.valueOf(role.toUpperCase());
            user.setType(newRole);
            User updated = userRepository.save(user);
            return convertToDTO(updated);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Gecersiz rol: " + role + 
                ". Gecerli roller: CONSUMER, PRODUCER, ADMIN, SUPER_ADMIN, MANAGER, FINANCE");
        }
    }
    
    @Transactional
    public void permanentlyDeleteUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + id));
        
        // Hard delete - kullanıcıyı tamamen sil
        userRepository.delete(java.util.Objects.requireNonNull(user));
    }
    
    @Transactional
    public void sendEmailToUser(@NonNull Long id, @NonNull String subject, @NonNull String message) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + id));
        
        // Send real email via EmailService
        emailService.sendCustomEmail(user.getEmail(), user.getName(), subject, message);
    }
    
    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        String lowercaseQuery = query.toLowerCase(Locale.ENGLISH);
        return userRepository.findAll().stream()
                .filter(user -> 
                    user.getName().toLowerCase(Locale.ENGLISH).contains(lowercaseQuery) ||
                    user.getEmail().toLowerCase(Locale.ENGLISH).contains(lowercaseQuery) ||
                    (user.getPhone() != null && user.getPhone().contains(lowercaseQuery))
                )
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Change user password
     */
    @Transactional
    public void changePassword(@NonNull Long userId, @NonNull String currentPassword, @NonNull String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mevcut şifre yanlış");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(false); // Şifre değiştirildi, zorunluluk kalktı
        userRepository.save(user);
        
        // Send email notification
        try {
            emailService.sendPasswordChangedEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            System.out.println("Şifre değiştirildi ancak bildirim e-postası gönderilemedi: " + e.getMessage());
        }
    }

    private String generateTempPassword() {
        // Generate 8 character random password
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    // ==================== KULLANICI BAZLI KOMISYON ORANI ====================
    
    @Transactional
    public void updateCommissionRate(@NonNull Long userId, @NonNull Double rate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        
        user.setCommissionRate(rate);
        userRepository.save(user);
        
        System.out.println("Kullanici " + userId + " komisyon orani guncellendi: %" + rate);
    }
    
    @Transactional(readOnly = true)
    public Double getCommissionRate(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        
        // Kullanici bazli oran varsa onu don, yoksa null don (varsayilan kullanilacak)
        return user.getCommissionRate();
    }
    
    /**
     * Kullanici icin efektif komisyon oranini hesapla
     * (kullanici bazli yoksa varsayilan site ayarlarindan alir)
     */
    @Transactional(readOnly = true)
    public Double getEffectiveCommissionRate(@NonNull Long userId, @NonNull Double defaultRate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        
        if (user.getCommissionRate() != null) {
            return user.getCommissionRate();
        }
        return defaultRate;
    }
    
    @Transactional
    public void recordLogin(@NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        
        user.setLastLoginDate(LocalDateTime.now());
        user.setLoginCount((user.getLoginCount() != null ? user.getLoginCount() : 0) + 1);
        
        // Registration date yoksa set et (migration icin)
        if (user.getRegistrationDate() == null) {
            user.setRegistrationDate(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now());
        }
        
        userRepository.save(user);
    }
}
