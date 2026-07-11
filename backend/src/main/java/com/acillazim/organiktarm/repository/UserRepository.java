package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    long countByType(User.UserType type);
    
    // Find users by type (for MessageService)
    List<User> findByType(User.UserType type);
    
    // Find inactive users (for UserEngagementService)
    @Query("SELECT u FROM User u WHERE u.lastLoginDate < :date OR u.lastLoginDate IS NULL")
    List<User> findByLastLoginDateBeforeOrLastLoginDateIsNull(@Param("date") LocalDateTime date);
}
