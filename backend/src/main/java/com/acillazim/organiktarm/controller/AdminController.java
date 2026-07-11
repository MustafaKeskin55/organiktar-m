package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.dto.*;
import com.acillazim.organiktarm.entity.*;
import com.acillazim.organiktarm.service.*;
import com.acillazim.organiktarm.dto.ProducerEarningsDTO;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
// Allow any authenticated user - role check will be done at method level if needed
@PreAuthorize("isAuthenticated()")
public class AdminController {

    private final SiteSettingsService siteSettingsService;
    private final PaymentSettingsService paymentSettingsService;
    private final FinancialReportService financialReportService;
    private final UserService userService;
    private final OrderService orderService;
    private final ProductService productService;
    private final EmailService emailService;
    private final UserEngagementService userEngagementService;
    private final ScheduledEmailService scheduledEmailService;
    private final MessageService messageService;
    private final CouponService couponService;
    private final com.acillazim.organiktarm.repository.UserRetentionPlanRepository retentionPlanRepository;
    private final com.acillazim.organiktarm.repository.ScheduledEmailRepository scheduledEmailRepository;

    // ==================== SITE SETTINGS ====================

    @GetMapping("/settings")
    public ResponseEntity<SiteSettingsDTO> getSiteSettings() {
        return ResponseEntity.ok(siteSettingsService.getSettings());
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<SiteSettingsDTO> updateSiteSettings(@RequestBody SiteSettingsDTO dto) {
        return ResponseEntity.ok(siteSettingsService.updateSettings(dto));
    }

    @PutMapping("/settings/commission")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<SiteSettingsDTO> updateCommissionRate(@RequestParam BigDecimal rate) {
        return ResponseEntity.ok(siteSettingsService.updateCommissionRate(rate));
    }

    // ==================== PAYMENT SETTINGS ====================

    @GetMapping("/payment-settings")
    public ResponseEntity<List<PaymentSettingsDTO>> getAllPaymentSettings() {
        return ResponseEntity.ok(paymentSettingsService.getAllPaymentSettings());
    }

    @GetMapping("/payment-settings/active")
    public ResponseEntity<PaymentSettingsDTO> getActivePaymentSettings() {
        return ResponseEntity.ok(paymentSettingsService.getActivePaymentSettings());
    }

    @PostMapping("/payment-settings")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<PaymentSettingsDTO> savePaymentSettings(@RequestBody @NonNull PaymentSettingsDTO dto) {
        return ResponseEntity.ok(paymentSettingsService.savePaymentSettings(dto));
    }

    @PutMapping("/payment-settings/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<PaymentSettingsDTO> updatePaymentSettings(@PathVariable @NonNull Long id, @RequestBody @NonNull PaymentSettingsDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(paymentSettingsService.savePaymentSettings(dto));
    }

    @DeleteMapping("/payment-settings/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deletePaymentSettings(@PathVariable @NonNull Long id) {
        paymentSettingsService.deletePaymentSettings(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/payment-settings/iban")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<PaymentSettingsDTO> updateIbanInfo(@RequestBody Map<String, String> ibanInfo) {
        String bankName = ibanInfo.get("bankName");
        String accountHolder = ibanInfo.get("accountHolder");
        String iban = ibanInfo.get("iban");
        return ResponseEntity.ok(paymentSettingsService.updateIbanInfo(
            bankName != null ? bankName : "",
            accountHolder != null ? accountHolder : "",
            iban != null ? iban : ""
        ));
    }

    // ==================== FINANCIAL REPORTS ====================

    @GetMapping("/reports/daily")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE') or hasRole('MANAGER')")
    public ResponseEntity<List<FinancialReportDTO>> getDailyReports(@RequestParam(defaultValue = "30") int limit) {
        return ResponseEntity.ok(financialReportService.getDailyReports(limit));
    }

    @GetMapping("/reports/monthly")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<List<FinancialReportDTO>> getMonthlyReports() {
        return ResponseEntity.ok(financialReportService.getMonthlyReports());
    }

    @GetMapping("/reports/dashboard")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<FinancialReportDTO> getDashboardStats() {
        return ResponseEntity.ok(financialReportService.getDashboardStats());
    }

    @GetMapping("/reports/revenue")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<FinancialReport.RevenueSummary> getRevenueSummary(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(financialReportService.getRevenueSummary(start, end));
    }

    // ==================== DASHBOARD STATS ====================

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam(required = false) String period) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userService.countUsers());
            stats.put("totalOrders", orderService.getTotalOrderCount());
            stats.put("totalRevenue", orderService.getTotalRevenue());

            var products = productService.getAllProducts();
            stats.put("totalProducts", products != null ? products.size() : 0);

            var pendingOrders = orderService.getOrdersByStatus("beklemede");
            stats.put("pendingOrders", pendingOrders != null ? pendingOrders.size() : 0);

            stats.put("newUsersToday", 0);
            stats.put("lowStockProducts", 0);

            var settings = siteSettingsService.getSettings();
            stats.put("commissionRate", settings != null && settings.getCommissionRate() != null ? settings.getCommissionRate() : 5.0);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Dashboard stats ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // ==================== PRODUCER EARNINGS ====================

    @GetMapping("/producer-earnings/{producerId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<ProducerEarningsDTO> getProducerEarnings(@PathVariable @NonNull Long producerId) {
        return ResponseEntity.ok(orderService.getProducerEarnings(producerId));
    }

    // ==================== USER MANAGEMENT (SUPER ADMIN) ====================

    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<UserDTO>> getAllUsersForAdmin() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(userService.toggleUserActiveStatus(id, active));
    }

    @PutMapping("/users/{id}/reset-password")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> resetUserPassword(@PathVariable Long id) {
        String tempPassword = userService.resetUserPassword(id);
        return ResponseEntity.ok(Map.of(
            "message", "Sifre basariyla sifirlandi",
            "tempPassword", tempPassword,
            "note", "Kullaniciya bu gecici sifreyi iletin"
        ));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}/delete")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> permanentlyDeleteUser(@PathVariable Long id) {
        userService.permanentlyDeleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Kullanici kalici olarak silindi"));
    }

    @PostMapping("/users/{id}/send-email")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, String>> sendEmailToUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> emailData) {
        String subject = emailData.get("subject");
        String message = emailData.get("message");
        userService.sendEmailToUser(id, subject, message);
        return ResponseEntity.ok(Map.of("message", "E-posta basariyla gonderildi"));
    }

    @GetMapping("/users/search")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    // ==================== EMAIL TEMPLATES ====================

    @GetMapping("/email-templates")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<EmailService.EmailTemplate[]> getEmailTemplates() {
        return ResponseEntity.ok(emailService.getAvailableTemplates());
    }

    @PostMapping("/users/{id}/send-template-email")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, String>> sendTemplateEmail(
            @PathVariable @NonNull Long id,
            @RequestParam @NonNull String template,
            @RequestParam @NonNull String subject,
            @RequestBody Map<String, String> params) {

        try {
            EmailService.EmailTemplate emailTemplate = EmailService.EmailTemplate.valueOf(template);
            UserDTO user = userService.getUserById(id);

            Object[] templateParams = params.values().toArray();
            emailService.sendEmailWithTemplate(user.getEmail(), user.getName(), emailTemplate, templateParams);

            return ResponseEntity.ok(Map.of("message", emailTemplate.getDisplayName() + " e-postası gönderildi"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Geçersiz şablon: " + template));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-posta gönderilemedi: " + e.getMessage()));
        }
    }

    // ==================== KULLANICI ENGAGEMENT & AI PLANLARI ====================

    @GetMapping("/users/inactive")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> getInactiveUsers(
            @RequestParam(defaultValue = "30") int daysInactive) {
        List<User> inactiveUsers = userEngagementService.getInactiveUsersReport(daysInactive);
        List<Map<String, Object>> result = inactiveUsers.stream()
            .map(user -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", user.getId());
                map.put("name", user.getName());
                map.put("email", user.getEmail());
                map.put("lastLoginDate", user.getLastLoginDate());
                map.put("loginCount", user.getLoginCount());
                return map;
            })
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users/{id}/create-retention-plan")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createRetentionPlan(@PathVariable @NonNull Long id) {
        try {
            List<UserRetentionPlan> plans = userEngagementService.identifyInactiveUsersAndCreatePlans();
            UserRetentionPlan userPlan = plans.stream()
                .filter(p -> p.getUser().getId().equals(id))
                .findFirst()
                .orElse(null);

            if (userPlan != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("planId", userPlan.getId());
                response.put("planType", userPlan.getPlanType());
                response.put("discountCode", userPlan.getDiscountCode());
                response.put("discountPercentage", userPlan.getDiscountPercentage());
                response.put("aiPlan", userPlan.getAiGeneratedPlan());
                response.put("suggestedActions", userPlan.getSuggestedActions());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Plan olusturulamadi veya kullanici aktif"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/{id}/retention-plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserRetentionPlan>> getUserRetentionPlans(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(retentionPlanRepository.findByUserId(id));
    }

    @GetMapping("/retention-plans/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UserRetentionPlan>> getPendingRetentionPlans() {
        return ResponseEntity.ok(retentionPlanRepository.findByStatus("ACTIVE"));
    }

    // ==================== KULLANICI BAZLI KOMISYON ====================

    @PutMapping("/users/{id}/commission-rate")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<Map<String, Object>> updateUserCommissionRate(
            @PathVariable @NonNull Long id,
            @RequestParam @NonNull Double rate) {
        try {
            if (rate < 0 || rate > 100) {
                return ResponseEntity.badRequest().body(Map.of("error", "Komisyon orani 0-100 arasinda olmalidir"));
            }

            // Verify user exists
            userService.getUserById(id);
            userService.updateCommissionRate(id, rate);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", id);
            response.put("commissionRate", rate);
            response.put("message", "Kullanici komisyon orani guncellendi");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users/{id}/commission-rate")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<Map<String, Object>> getUserCommissionRate(@PathVariable @NonNull Long id) {
        try {
            // Verify user exists
            userService.getUserById(id);
            Double rate = userService.getCommissionRate(id);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", id);
            response.put("commissionRate", rate);
            response.put("isDefault", rate == null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== OTOMATIK E-POSTA YONETIMI ====================

    @PostMapping("/scheduled-emails/trigger")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerScheduledEmails() {
        try {
            scheduledEmailService.processPendingEmails();
            return ResponseEntity.ok(Map.of("message", "Bekleyen e-postalar isleme alindi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{id}/send-welcome-now")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> sendWelcomeEmailNow(@PathVariable @NonNull Long id) {
        try {
            userEngagementService.sendWelcomeEmailImmediately(id);
            return ResponseEntity.ok(Map.of("message", "Hos geldin e-postasi aninda gonderildi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/scheduled-emails/user/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ScheduledEmail>> getUserScheduledEmails(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(scheduledEmailRepository.findByUserId(id));
    }

    // ==================== MESAJ YONETİMİ (Admin Panel) ====================

    @GetMapping("/messages")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Message>> getAllMessages() {
        // Admin için tüm mesajları getir
        return ResponseEntity.ok(messageService.getAllMessagesForAdmin(1L)); // Admin ID: 1
    }

    @GetMapping("/messages/unread-count")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Integer>> getUnreadMessageCount() {
        int count = messageService.getUnreadCountForAdmin(1L); // Admin ID: 1
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/messages/{messageId}/reply")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> replyToMessage(
            @PathVariable @NonNull Long messageId,
            @RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Yanıt içeriği boş olamaz"));
            }

            // Admin ID: 1 (Super Admin)
            Message reply = messageService.replyToMessage(1L, messageId, content);
            return ResponseEntity.ok(Map.of(
                "message", "Yanıt başarıyla gönderildi",
                "replyId", reply.getId(),
                "recipient", reply.getReceiver().getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/messages/{messageId}/mark-read")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, String>> markMessageAsRead(@PathVariable Long messageId) {
        try {
            messageService.markAsRead(messageId);
            return ResponseEntity.ok(Map.of("message", "Mesaj okundu olarak işaretlendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/messages/thread/{messageId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Message>> getMessageThread(@PathVariable @NonNull Long messageId) {
        return ResponseEntity.ok(messageService.getMessageThread(messageId));
    }

    // ==================== İNDİRİM KODU YÖNETİMİ ====================

    @GetMapping("/coupons")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping("/coupons")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createCoupon(@RequestBody Map<String, Object> request) {
        try {
            CouponCreateRequest dto = new CouponCreateRequest();
            dto.setCode((String) request.getOrDefault("code", ""));
            dto.setDescription((String) request.get("description"));
            dto.setDiscountType((String) request.get("discountType"));
            dto.setDiscountValue(new BigDecimal(request.get("discountValue").toString()));
            dto.setMinOrderAmount(request.containsKey("minOrderAmount") ?
                new BigDecimal(request.get("minOrderAmount").toString()) : BigDecimal.ZERO);
            dto.setMaxDiscountAmount(request.containsKey("maxDiscountAmount") ?
                new BigDecimal(request.get("maxDiscountAmount").toString()) : null);
            dto.setUsageLimit(request.containsKey("usageLimit") ?
                Integer.parseInt(request.get("usageLimit").toString()) : null);
            dto.setPerUserLimit(request.containsKey("perUserLimit") ?
                Integer.parseInt(request.get("perUserLimit").toString()) : 1);
            dto.setStartDate(LocalDateTime.parse((String) request.get("startDate")));
            dto.setEndDate(LocalDateTime.parse((String) request.get("endDate")));

            Coupon coupon = couponService.createCoupon(dto, 1L);

            return ResponseEntity.ok(Map.of(
                "message", "İndirim kodu başarıyla oluşturuldu",
                "couponId", coupon.getId(),
                "code", coupon.getCode()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/coupons/{couponId}/deactivate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> deactivateCoupon(@PathVariable @NonNull Long couponId) {
        try {
            couponService.deactivateCoupon(couponId);
            return ResponseEntity.ok(Map.of("message", "Kupon pasife alındı"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/coupons/validate")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());
            Long userId = request.containsKey("userId") ? Long.parseLong(request.get("userId").toString()) : null;

            java.util.Optional<Coupon> couponOpt = couponService.validateCoupon(code != null ? code : "", userId, orderAmount);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Kupon bulunamadı veya geçersiz"));
            }

            Coupon coupon = java.util.Objects.requireNonNull(couponOpt.get());
            BigDecimal discount = couponService.calculateDiscount(coupon, orderAmount);

            return ResponseEntity.ok(Map.of(
                "valid", true,
                "code", coupon.getCode(),
                "discountType", coupon.getDiscountType(),
                "discountValue", coupon.getDiscountValue(),
                "calculatedDiscount", discount,
                "description", coupon.getDescription() != null ? coupon.getDescription() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", e.getMessage()));
        }
    }
}
