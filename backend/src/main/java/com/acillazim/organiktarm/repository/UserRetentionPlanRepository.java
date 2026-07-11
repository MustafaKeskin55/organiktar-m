package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.UserRetentionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRetentionPlanRepository extends JpaRepository<UserRetentionPlan, Long> {
    
    List<UserRetentionPlan> findByUserId(Long userId);
    
    List<UserRetentionPlan> findByUserIdAndStatus(Long userId, String status);
    
    Optional<UserRetentionPlan> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    
    List<UserRetentionPlan> findByStatus(String status);
}