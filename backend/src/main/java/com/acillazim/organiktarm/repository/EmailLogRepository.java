package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    
    List<EmailLog> findByUserId(Long userId);
    
    @Query("SELECT el FROM EmailLog el WHERE el.user.id = :userId AND el.templateType = :templateType AND el.sentAt >= :since")
    List<EmailLog> findByUserIdAndTemplateTypeSince(Long userId, String templateType, LocalDateTime since);
    
    @Query("SELECT COUNT(el) FROM EmailLog el WHERE el.user.id = :userId AND el.templateType = :templateType AND el.sentAt >= :since")
    Long countByUserIdAndTemplateTypeSince(Long userId, String templateType, LocalDateTime since);
}