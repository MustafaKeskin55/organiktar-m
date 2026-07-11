package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.ScheduledEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduledEmailRepository extends JpaRepository<ScheduledEmail, Long> {
    
    @Query("SELECT se FROM ScheduledEmail se WHERE se.status = 'PENDING' AND se.scheduledDate <= :now")
    List<ScheduledEmail> findPendingEmailsToSend(@Param("now") LocalDateTime now);
    
    List<ScheduledEmail> findByUserIdAndStatus(Long userId, ScheduledEmail.Status status);
    
    List<ScheduledEmail> findByUserId(Long userId);
    
    // Method for scheduled email service
    List<ScheduledEmail> findByStatusAndScheduledDateBefore(ScheduledEmail.Status status, LocalDateTime date);
}