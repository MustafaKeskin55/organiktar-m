package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.*;
import com.acillazim.organiktarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("unused")
public class UserEngagementService {

    private final UserRepository userRepository;
    private final UserRetentionPlanRepository retentionPlanRepository;
    private final EmailService emailService;
    private final OrderRepository orderRepository; // Future use for order-based engagement

    public void recordUserLogin(@NonNull Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setLastLoginDate(LocalDateTime.now());
        user.setLoginCount(user.getLoginCount() + 1);
        userRepository.save(user);
    }

    public void sendWelcomeEmailImmediately(@NonNull Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());
    }

    public UserRetentionPlan createRetentionPlan(@NonNull Long userId, Map<String, Object> data) {
        User user = userRepository.findById(userId).orElseThrow();
        
        UserRetentionPlan plan = new UserRetentionPlan();
        plan.setUser(user);
        plan.setPlanType(UserRetentionPlan.PlanType.valueOf((String) data.get("planType")));
        plan.setDescription((String) data.get("description"));
        plan.setDiscountPercentage(Double.valueOf(data.get("discountPercentage").toString()));
        plan.setExecuted(false);
        plan.setCreatedAt(LocalDateTime.now());
        
        return retentionPlanRepository.save(plan);
    }

    public List<User> getInactiveUsersReport(int daysInactive) {
        LocalDateTime daysAgo = LocalDateTime.now().minusDays(daysInactive);
        return userRepository.findByLastLoginDateBeforeOrLastLoginDateIsNull(daysAgo);
    }

    public void scheduleAnniversaryEmails() {
        // Yıldönümü e-postalarını planla
    }

    public List<UserRetentionPlan> identifyInactiveUsersAndCreatePlans() {
        // Aktif olmayan kullanıcıları tespit et ve plan oluştur
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<User> inactiveUsers = userRepository.findByLastLoginDateBeforeOrLastLoginDateIsNull(thirtyDaysAgo);
        
        List<UserRetentionPlan> createdPlans = new java.util.ArrayList<>();
        for (User user : inactiveUsers) {
            // Check if plan already exists
            boolean planExists = retentionPlanRepository.findByUserId(user.getId()).stream()
                .anyMatch(p -> "ACTIVE".equals(p.getStatus()));
            
            if (!planExists) {
                UserRetentionPlan plan = new UserRetentionPlan();
                plan.setUser(user);
                plan.setPlanType(UserRetentionPlan.PlanType.INACTIVE);
                plan.setDescription("Kullanıcı geri kazanım planı - 30 gün inaktif");
                plan.setDiscountPercentage(10.0);
                plan.setDiscountCode("RETURN10" + user.getId());
                plan.setStatus("ACTIVE");
                plan.setCreatedAt(LocalDateTime.now());
                plan.setAiGeneratedPlan("Özel indirim kodu ve kişiselleştirilmiş e-posta gönder");
                plan.setSuggestedActions("1. Hoşgeldiniz e-postası gönder\n2. %10 indirim kodu sun\n3. Yeni ürünleri bildir");
                
                UserRetentionPlan saved = retentionPlanRepository.save(plan);
                createdPlans.add(saved);
            }
        }
        return createdPlans;
    }
}
