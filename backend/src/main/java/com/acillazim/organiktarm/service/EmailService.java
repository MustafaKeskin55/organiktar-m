package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.ScheduledEmail;
import com.acillazim.organiktarm.entity.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;
    
    @Value("${app.logo.url:http://localhost:8081/images/logo.jpg}")
    private String logoUrl;
    
    private static final String SITE_NAME = "ÇiftçidenKapına";
    private static final String SITE_URL = "http://localhost:5173";
    private static final String COMPANY_NAME = "ÇiftçidenKapına E-Ticaret A.S.";
    private static final String PRIMARY_COLOR = "#22c55e";
    private static final String PRIMARY_COLOR_DARK = "#16a34a";
    
    // ==================== TEMPLATE ENUM ====================
    
    public enum EmailTemplate {
        WELCOME("Hos Geldiniz", "welcome"),
        PASSWORD_RESET("Sifre Sifirlama", "password-reset"),
        PASSWORD_CHANGED("Sifre Degistirildi", "password-changed"),
        ORDER_CONFIRMATION("Siparis Onayi", "order-confirmation"),
        ORDER_STATUS_UPDATE("Siparis Durumu Guncellemesi", "order-status"),
        PROMOTION("Kampanya/Indirim", "promotion"),
        NEW_PRODUCTS("Yeni Urunler", "new-products"),
        ACCOUNT_ACTIVATION("Hesap Aktivasyonu", "activation"),
        BIRTHDAY("Dogum Gunu Kutlamasi", "birthday"),
        HOLIDAY("Ozel Gun/Indirim", "holiday"),
        CONTACT_REPLY("Iletisim Formu Yaniti", "contact"),
        CUSTOM("Ozel Mesaj", "custom");
        
        private final String displayName;
        private final String templateId;
        
        EmailTemplate(String displayName, String templateId) {
            this.displayName = displayName;
            this.templateId = templateId;
        }
        
        public String getDisplayName() { return displayName; }
        public String getTemplateId() { return templateId; }
    }
    
    // ==================== HTML EMAIL TEMPLATES ====================
    
    private String getBaseHtmlTemplate(String userName, String content, String preheader) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html lang='tr'>");
        sb.append("<head>");
        sb.append("<meta charset='UTF-8'>");
        sb.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        sb.append("<title>").append(SITE_NAME).append("</title>");
        sb.append("<style>");
        sb.append("body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif; }");
        sb.append(".email-wrapper { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }");
        sb.append(".header { background: linear-gradient(135deg, ").append(PRIMARY_COLOR).append(" 0%, ").append(PRIMARY_COLOR_DARK).append(" 100%); padding: 30px; text-align: center; }");
        sb.append(".logo { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.5); object-fit: cover; }");
        sb.append(".site-title { color: #ffffff; margin: 10px 0 0; font-size: 28px; font-weight: 700; }");
        sb.append(".tagline { color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px; }");
        sb.append(".content { padding: 30px; background: #ffffff; }");
        sb.append(".greeting { font-size: 20px; color: #333; margin-bottom: 20px; font-weight: 600; }");
        sb.append(".greeting span { color: ").append(PRIMARY_COLOR).append("; }");
        sb.append(".message { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 25px; }");
        sb.append(".message strong { color: ").append(PRIMARY_COLOR_DARK).append("; }");
        sb.append(".highlight-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid ").append(PRIMARY_COLOR).append("; padding: 20px; margin: 20px 0; border-radius: 8px; }");
        sb.append(".highlight-box h3 { color: ").append(PRIMARY_COLOR_DARK).append("; margin: 0 0 10px 0; font-size: 16px; }");
        sb.append(".highlight-box p { margin: 5px 0; color: #166534; font-size: 14px; }");
        sb.append(".highlight-box .big-text { font-size: 24px; font-weight: 700; color: ").append(PRIMARY_COLOR_DARK).append("; letter-spacing: 1px; }");
        sb.append(".button { display: inline-block; background: linear-gradient(135deg, ").append(PRIMARY_COLOR).append(" 0%, ").append(PRIMARY_COLOR_DARK).append(" 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 15px; margin: 15px 0; }");
        sb.append(".info-box { background: #fefce8; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px; color: #92400e; }");
        sb.append(".info-box strong { color: #b45309; }");
        sb.append(".discount-badge { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 16px; display: inline-block; margin: 10px 0; }");
        sb.append(".countdown { background: #1f2937; color: white; padding: 12px; border-radius: 8px; text-align: center; margin: 15px 0; }");
        sb.append(".countdown-time { font-size: 20px; font-weight: 700; color: ").append(PRIMARY_COLOR).append("; }");
        sb.append(".divider { height: 1px; background: #e5e7eb; margin: 25px 0; }");
        sb.append(".social-section { text-align: center; margin: 20px 0; }");
        sb.append(".social-title { color: #6b7280; font-size: 13px; margin-bottom: 10px; }");
        sb.append(".footer { background: #f9fafb; padding: 25px; text-align: center; border-top: 3px solid ").append(PRIMARY_COLOR).append("; }");
        sb.append(".company-name { color: ").append(PRIMARY_COLOR_DARK).append("; font-weight: 700; font-size: 18px; margin-bottom: 8px; }");
        sb.append(".footer-text { color: #6b7280; font-size: 12px; margin: 4px 0; }");
        sb.append(".footer-links { margin: 15px 0; }");
        sb.append(".footer-links a { color: ").append(PRIMARY_COLOR_DARK).append("; text-decoration: none; margin: 0 10px; font-size: 12px; }");
        sb.append(".copyright { color: #9ca3af; font-size: 11px; margin-top: 15px; }");
        sb.append("</style>");
        sb.append("</head>");
        sb.append("<body>");
        sb.append("<table class='email-wrapper' cellpadding='0' cellspacing='0' border='0'>");
        sb.append("<tr><td>");
        sb.append("<div class='header'>");
        sb.append("<img src='").append(logoUrl).append("' alt='").append(SITE_NAME).append("' class='logo' />");
        sb.append("<h1 class='site-title'>").append(SITE_NAME).append("</h1>");
        sb.append("<p class='tagline'>Ciftciden Sofraniza, Taze ve Dogal</p>");
        sb.append("</div>");
        sb.append("<div class='content'>");
        sb.append("<div class='greeting'>Merhaba <span>").append(userName).append("</span></div>");
        sb.append(content);
        sb.append("<div class='divider'></div>");
        sb.append("<div class='social-section'>");
        sb.append("<p class='social-title'>Bizi Takip Edin</p>");
        sb.append("</div>");
        sb.append("</div>");
        sb.append("<div class='footer'>");
        sb.append("<div class='company-name'>").append(COMPANY_NAME).append("</div>");
        sb.append("<p class='footer-text'>Ornek Mah. Ciftci Cad. No:123 Istanbul</p>");
        sb.append("<p class='footer-text'>0850 123 45 67 | info@ciftcidenkapina.com</p>");
        sb.append("<div class='footer-links'>");
        sb.append("<a href='").append(SITE_URL).append("/urunler'>Urunler</a>");
        sb.append("<a href='").append(SITE_URL).append("/ureticiler'>Ureticiler</a>");
        sb.append("<a href='").append(SITE_URL).append("/hakkimizda'>Hakkimizda</a>");
        sb.append("</div>");
        sb.append("<p class='copyright'>2026 ").append(SITE_NAME).append(". Tum haklari saklidir.</p>");
        sb.append("</div>");
        sb.append("</td></tr>");
        sb.append("</table>");
        sb.append("</body>");
        sb.append("</html>");
        return sb.toString();
    }
    
    // ==================== WELCOME TEMPLATE ====================
    
    private String getWelcomeContent() {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append("<strong>").append(SITE_NAME).append("</strong> ailesine hos geldiniz!<br><br>");
        sb.append("Artik <strong>dogal ve taze urunlere</strong> kolayca ulasabilirsiniz. ");
        sb.append("Ciftcilerden direkt olarak kapiniza taze urunler geliyor.<br><br>");
        sb.append("Katkisiz, dogal ve organik urunlerle saglikli bir yasam sizi bekliyor!");
        sb.append("</div>");
        sb.append("<div class='highlight-box'>");
        sb.append("<h3>Neler Yapabilirsiniz?</h3>");
        sb.append("<p>✓ Taze sebze ve meyve siparisi verin</p>");
        sb.append("<p>✓ Yerel ciftcileri kesfedin</p>");
        sb.append("<p>✓ Dogal ve organik urunler satin alin</p>");
        sb.append("<p>✓ Abonelik paketleriyle duzenli teslimat alin</p>");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/urunler' class='button'>Alisverise Basla</a>");
        return sb.toString();
    }
    
    // ==================== PASSWORD RESET TEMPLATE ====================
    
    private String getPasswordResetContent(String tempPassword) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append("Hesabinizin sifresi <strong>yonetici tarafindan sifirlandi.</strong><br><br>");
        sb.append("Guvenliginiz icin asagidaki gecici sifre ile giris yaptiktan sonra ");
        sb.append("<strong>mutlaka yeni bir sifre belirleyin.</strong>");
        sb.append("</div>");
        sb.append("<div class='highlight-box'>");
        sb.append("<h3>Gecici Sifreniz</h3>");
        sb.append("<p class='big-text'>").append(tempPassword).append("</p>");
        sb.append("<p style='margin-top: 10px; font-size: 12px; color: #666;'>");
        sb.append("Bu sifreyi kimseyle paylasmayin.");
        sb.append("</p>");
        sb.append("</div>");
        sb.append("<div class='info-box'>");
        sb.append("<strong>Onemli:</strong> Ilk girisinizde sistem sizi otomatik olarak sifre degistirme sayfasina yonlendirecektir.");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/giris' class='button'>Giris Yap</a>");
        return sb.toString();
    }
    
    // ==================== PASSWORD CHANGED TEMPLATE ====================
    
    private String getPasswordChangedContent() {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append("Hesabinizin sifresi <strong style='color: #22c55e;'>basariyla degistirildi.</strong><br><br>");
        sb.append("Hesap guvenliginiz artik daha da guclendi!");
        sb.append("</div>");
        sb.append("<div class='info-box'>");
        sb.append("<strong>Guvenlik Ipuclari:</strong><br>");
        sb.append("• Guclu sifreler kullanin<br>");
        sb.append("• Sifrenizi duzenli olarak degistirin<br>");
        sb.append("• Ayni sifreyi farkli platformlarda kullanmayin");
        sb.append("</div>");
        sb.append("<div class='info-box' style='background: #fee2e2; border-color: #ef4444; color: #991b1b;'>");
        sb.append("<strong>SUpheli Durum:</strong> Eger bu islemi siz yapmadinizsa, lutfen hemen bizimle iletisime gecin!");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/giris' class='button'>Ana Sayfa</a>");
        return sb.toString();
    }
    
    // ==================== ORDER CONFIRMATION TEMPLATE ====================
    
    private String getOrderConfirmationContent(String orderNumber, double totalAmount) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append("Siparisiniz <strong style='color: #22c55e;'>basariyla alindi!</strong><br><br>");
        sb.append("En kisa surede hazirlanacak ve kargoya verilecektir.");
        sb.append("</div>");
        sb.append("<div class='highlight-box'>");
        sb.append("<h3>Siparis Bilgileri</h3>");
        sb.append("<p><strong>Siparis No:</strong> ").append(orderNumber).append("</p>");
        sb.append("<p><strong>Toplam Tutar:</strong> <span style='font-size: 18px; color: #22c55e; font-weight: 700;'>");
        sb.append(String.format("%.2f TL", totalAmount)).append("</span></p>");
        sb.append("<p style='margin-top: 10px; color: #666;'>Tahmini teslimat: 2-3 is gunu</p>");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/siparislerim' class='button'>Siparisimi Takip Et</a>");
        return sb.toString();
    }
    
    // ==================== ORDER STATUS TEMPLATE ====================
    
    private String getOrderStatusContent(String orderNumber, String newStatus) {
        String statusText;
        switch(newStatus.toLowerCase()) {
            case "hazirlaniyor":
                statusText = "Hazirlaniyor";
                break;
            case "yolda":
                statusText = "Yolda";
                break;
            case "teslim-edildi":
                statusText = "Teslim Edildi";
                break;
            default:
                statusText = newStatus;
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append("<strong>Siparisinizin durumu guncellendi!</strong><br><br>");
        sb.append("</div>");
        sb.append("<div class='highlight-box'>");
        sb.append("<h3>Siparis No: ").append(orderNumber).append("</h3>");
        sb.append("<p style='font-size: 20px; font-weight: 700; color: #22c55e; margin: 10px 0;'>");
        sb.append(statusText).append("</p>");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/siparislerim' class='button'>Siparis Detaylari</a>");
        return sb.toString();
    }
    
    // ==================== PROMOTION/DISCOUNT TEMPLATE ====================
    
    private String getPromotionContent(String discountCode, String discountPercentage, String validUntil) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append("<strong>Ozel Indirim Firsati!</strong><br><br>");
        sb.append("Sizin icin ozel hazirladigimiz bu kampanyayi kacirmayin!");
        sb.append("</div>");
        sb.append("<div class='discount-badge'>").append(discountPercentage).append(" INDIRIM</div>");
        sb.append("<div class='highlight-box'>");
        sb.append("<h3>Indirim Kodunuz</h3>");
        sb.append("<p class='big-text' style='font-family: monospace; background: white; padding: 10px; border-radius: 6px; border: 2px dashed #22c55e;'>");
        sb.append(discountCode).append("</p>");
        sb.append("<p style='margin-top: 10px;'>Kodu alisverisinizde kullanmayi unutmayin!</p>");
        sb.append("</div>");
        sb.append("<div class='countdown'>");
        sb.append("<p style='font-size: 12px; color: #9ca3af;'>Son Kullanma Tarihi</p>");
        sb.append("<p class='countdown-time'>").append(validUntil).append("</p>");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/urunler' class='button'>Alisverise Basla</a>");
        return sb.toString();
    }
    
    // ==================== BIRTHDAY TEMPLATE ====================
    
    private String getBirthdayContent() {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message' style='text-align: center;'>");
        sb.append("<strong style='font-size: 22px;'>Dogum Gununuz Kutlu Olsun!</strong><br><br>");
        sb.append("Bu ozel gununuzde sizi mutlu etmek istiyoruz!");
        sb.append("</div>");
        sb.append("<div class='highlight-box' style='text-align: center; background: #fce7f3; border-color: #ec4899;'>");
        sb.append("<h3 style='color: #be185d;'>Dogum Gunu Hediyeniz</h3>");
        sb.append("<p class='big-text' style='color: #be185d; font-size: 28px;'>%20 INDIRIM</p>");
        sb.append("<p style='margin-top: 10px; color: #9d174d;'>Dogum gunu boyunca tum alisverislerinizde!</p>");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/urunler' class='button' style='background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);'>Alisverise Basla</a>");
        return sb.toString();
    }
    
    // ==================== HOLIDAY/SEASONAL TEMPLATE ====================
    
    private String getHolidayContent(String holidayName, String specialOffer) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message' style='text-align: center;'>");
        sb.append("<strong style='font-size: 20px;'>").append(holidayName).append(" Kutlu Olsun!</strong><br><br>");
        sb.append("Bu ozel gununuzde saglik, mutluluk ve bolluk dileriz!");
        sb.append("</div>");
        sb.append("<div class='highlight-box' style='text-align: center; background: #fef3c7; border-color: #f59e0b;'>");
        sb.append("<h3 style='color: #b45309;'>").append(holidayName).append(" Ozel Firsat</h3>");
        sb.append("<p class='big-text' style='color: #b45309; font-size: 24px;'>").append(specialOffer).append("</p>");
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("/urunler' class='button'>Firsatlari Gor</a>");
        return sb.toString();
    }
    
    // ==================== CUSTOM TEMPLATE ====================
    
    private String getCustomContent(@NonNull String customMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class='message'>");
        sb.append(customMessage.replace("\n", "<br>"));
        sb.append("</div>");
        sb.append("<a href='").append(SITE_URL).append("' class='button'>Siteyi Ziyaret Et</a>");
        return sb.toString();
    }
    
    // ==================== PUBLIC EMAIL SENDING METHODS ====================
    
    public void sendEmailWithTemplate(String to, String userName, EmailTemplate template, Object... params) {
        String content;
        String subject = template.getDisplayName() + " - " + SITE_NAME;
        String preheader;
        
        switch (template) {
            case WELCOME:
                content = getWelcomeContent();
                preheader = "CiftcidenKapina ailesine hos geldiniz!";
                break;
            case PASSWORD_RESET:
                content = getPasswordResetContent((String) params[0]);
                preheader = "Gecici sifreniz hazir";
                break;
            case PASSWORD_CHANGED:
                content = getPasswordChangedContent();
                preheader = "Sifreniz basariyla degistirildi";
                break;
            case ORDER_CONFIRMATION:
                content = getOrderConfirmationContent((String) params[0], (Double) params[1]);
                preheader = "Siparisiniz basariyla alindi";
                break;
            case ORDER_STATUS_UPDATE:
                content = getOrderStatusContent((String) params[0], (String) params[1]);
                preheader = "Siparis durumunuz guncellendi";
                break;
            case PROMOTION:
                content = getPromotionContent((String) params[0], (String) params[1], (String) params[2]);
                preheader = "Ozel indirim firsati!";
                break;
            case BIRTHDAY:
                content = getBirthdayContent();
                preheader = "Dogum gununuz kutlu olsun!";
                break;
            case HOLIDAY:
                content = getHolidayContent((String) params[0], (String) params[1]);
                preheader = "Ozel gun indirimi!";
                break;
            default:
                String param0 = params.length > 0 ? java.util.Objects.requireNonNull((String) params[0]) : "";
                content = getCustomContent(param0);
                preheader = SITE_NAME + "'dan ozel mesaj";
        }
        
        String safeTo = to != null ? to : "";
        String safeSubject = subject != null ? subject : "";
        String safeContent = content != null ? content : "";
        String safeUserName = userName != null ? userName : "";
        String safePreheader = preheader != null ? preheader : "";
        sendHtmlEmailWithTemplate(safeTo, safeSubject, safeContent, safeUserName, safePreheader);
    }
    
    private void sendHtmlEmailWithTemplate(@NonNull String to, @NonNull String subject, @NonNull String content, @NonNull String userName, @NonNull String preheader) {
        if (!mailEnabled || fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email service disabled. Would send to: {}", to);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            String safeUserName = java.util.Objects.requireNonNull(userName != null ? userName : "");
            String safeContent = java.util.Objects.requireNonNull(content != null ? content : "");
            String safePreheader = java.util.Objects.requireNonNull(preheader != null ? preheader : "");
            helper.setFrom(fromEmail != null ? fromEmail : "");
            helper.setTo(to != null ? to : "");
            helper.setSubject(subject != null ? subject : "");
            helper.setText(getBaseHtmlTemplate(safeUserName, safeContent, safePreheader), true);
            
            mailSender.send(message);
            log.info("{} email sent to: {}", subject, to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("E-posta gonderilemedi: " + e.getMessage());
        }
    }
    
    // ==================== LEGACY METHODS (Backward Compatibility) ====================
    
    public void sendPasswordResetEmail(String to, String userName, String tempPassword) {
        sendEmailWithTemplate(to, userName, EmailTemplate.PASSWORD_RESET, tempPassword);
    }
    
    public void sendPasswordChangedEmail(String to, String userName) {
        sendEmailWithTemplate(to, userName, EmailTemplate.PASSWORD_CHANGED);
    }
    
    public void sendWelcomeEmail(String to, String userName) {
        sendEmailWithTemplate(to, userName, EmailTemplate.WELCOME);
    }
    
    public void sendOrderConfirmationEmail(String to, String userName, String orderNumber, double totalAmount) {
        sendEmailWithTemplate(to, userName, EmailTemplate.ORDER_CONFIRMATION, orderNumber, totalAmount);
    }
    
    public void sendCustomEmail(String to, String userName, String subject, String message) {
        sendEmailWithTemplate(to, userName, EmailTemplate.CUSTOM, message);
    }
    
    // ==================== ADMIN API METHODS ====================
    
    /**
     * Send HTML email with custom content
     */
    public void sendHtmlEmail(@NonNull String to, @NonNull String subject, @NonNull String htmlContent, @NonNull String userName) {
        if (!mailEnabled || fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email service disabled. Would send to: {}", to);
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            String safeUserName = java.util.Objects.requireNonNull(userName != null ? userName : "");
            String safeHtmlContent = java.util.Objects.requireNonNull(htmlContent != null ? htmlContent : "");
            String safeSubject = java.util.Objects.requireNonNull(subject != null ? subject : "");
            helper.setFrom(fromEmail != null ? fromEmail : "");
            helper.setTo(to != null ? to : "");
            helper.setSubject(safeSubject);
            helper.setText(getBaseHtmlTemplate(safeUserName, safeHtmlContent, safeSubject), true);
            
            mailSender.send(message);
            log.info("Custom HTML email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("E-posta gonderilemedi: " + e.getMessage());
        }
    }
    
    /**
     * Send HTML email with custom content (3 parameter version for backward compatibility)
     */
    public void sendHtmlEmail(@NonNull String to, @NonNull String subject, @NonNull String htmlContent) {
        sendHtmlEmail(to, subject, htmlContent, "Değerli Müşterimiz");
    }
    
    public void sendCustomEmail(@NonNull String to, @NonNull String subject, @NonNull String message) {
        String safeMessage = java.util.Objects.requireNonNull(message != null ? message : "");
        sendHtmlEmail(to, subject, java.util.Objects.requireNonNull(getCustomContent(safeMessage)), "Özel Mesaj");
    }
    
    public void sendTemplateEmail(@NonNull String to, @NonNull String templateName, Map<String, String> params) {
        EmailTemplate template = EmailTemplate.valueOf(templateName);
        String userName = params != null ? params.getOrDefault("userName", "Değerli Müşterimiz") : "Değerli Müşterimiz";
        Object[] templateParams = params != null ? params.values().toArray() : new Object[]{};
        sendEmailWithTemplate(to, userName, template, templateParams);
    }
    
    public void sendScheduledEmail(ScheduledEmail email) {
        // Planlanmış e-posta gönderimi
        User user = email.getUser();
        if (user != null && user.getEmail() != null) {
            String userName = user.getName() != null ? user.getName() : "Değerli Müşterimiz";
            switch (email.getEmailType()) {
                case WELCOME:
                    sendWelcomeEmail(user.getEmail(), userName);
                    break;
                case ANNIVERSARY:
                    sendEmailWithTemplate(user.getEmail(), userName, EmailTemplate.HOLIDAY, "1. Yıl");
                    break;
                default:
                    sendCustomEmail(java.util.Objects.requireNonNull(user.getEmail()), "Bildirim", "Özel bildirim mesajı");
            }
        }
    }
    
    public boolean isEmailServiceConfigured() {
        return mailEnabled && !fromEmail.isEmpty();
    }
    
    public EmailTemplate[] getAvailableTemplates() {
        return EmailTemplate.values();
    }
}