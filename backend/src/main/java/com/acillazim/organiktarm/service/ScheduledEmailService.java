package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.ScheduledEmail;
import com.acillazim.organiktarm.repository.ScheduledEmailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduledEmailService {

    private final ScheduledEmailRepository scheduledEmailRepository;
    private final EmailService emailService;

    @Scheduled(fixedRate = 60000) // Her 1 dakika
    public void processScheduledEmails() {
        List<ScheduledEmail> pendingEmails = scheduledEmailRepository
            .findByStatusAndScheduledDateBefore(ScheduledEmail.Status.PENDING, LocalDateTime.now());
        
        for (ScheduledEmail email : pendingEmails) {
            try {
                emailService.sendScheduledEmail(email);
                email.setStatus(ScheduledEmail.Status.SENT);
                email.setSentAt(LocalDateTime.now());
            } catch (Exception e) {
                email.setStatus(ScheduledEmail.Status.FAILED);
            }
            scheduledEmailRepository.save(email);
        }
    }

    public List<ScheduledEmail> getUserScheduledEmails(Long userId) {
        return scheduledEmailRepository.findByUserId(userId);
    }
    
    // Alias for controller compatibility
    public void processPendingEmails() {
        processScheduledEmails();
    }
}
