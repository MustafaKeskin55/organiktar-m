package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Kullanıcının admin'e gönderdiği mesajlar (alias for backward compatibility)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId AND m.receiver.type = 'SUPER_ADMIN' ORDER BY m.createdAt DESC")
    List<Message> findBySenderToAdmin(@Param("userId") Long userId);
    
    // Kullanıcının admin'e gönderdiği mesajlar (MessageService compatibility)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId AND m.receiver.type = 'SUPER_ADMIN' ORDER BY m.createdAt DESC")
    List<Message> findBySenderIdToAdmin(@Param("userId") Long userId);
    
    // Admin'e gelen tüm mesajlar
    @Query("SELECT m FROM Message m WHERE m.receiver.id = :adminId AND m.sender.type != 'SUPER_ADMIN' ORDER BY m.createdAt DESC")
    List<Message> findMessagesToAdmin(@Param("adminId") Long adminId);
    
    // Admin'e gelen tüm mesajlar (no param version - finds any SUPER_ADMIN as receiver)
    @Query("SELECT m FROM Message m WHERE m.receiver.type = 'SUPER_ADMIN' AND m.sender.type != 'SUPER_ADMIN' ORDER BY m.createdAt DESC")
    List<Message> findMessagesToAdmin();
    
    // Admin'in yanıtları
    @Query("SELECT m FROM Message m WHERE m.sender.id = :adminId AND m.parentMessageId IS NOT NULL ORDER BY m.createdAt DESC")
    List<Message> findAdminReplies(@Param("adminId") Long adminId);
    
    // Admin yanıtları (kullanıcıya özel)
    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId AND m.sender.type = 'SUPER_ADMIN' AND m.parentMessageId IS NOT NULL ORDER BY m.createdAt DESC")
    List<Message> findAdminRepliesForUser(@Param("userId") Long userId);
    
    // Okunmamış mesaj sayısı (Admin için)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :adminId AND m.isRead = false AND m.sender.type != 'SUPER_ADMIN'")
    Long countUnreadMessagesForAdmin(@Param("adminId") Long adminId);
    
    // Okunmamış mesaj sayısı (Admin için - no param version)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.type = 'SUPER_ADMIN' AND m.isRead = false AND m.sender.type != 'SUPER_ADMIN'")
    Long countUnreadMessagesForAdmin();
    
    // Okunmamış mesaj sayısı (Kullanıcı için - admin yanıtları)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false AND m.sender.type = 'SUPER_ADMIN'")
    Long countUnreadRepliesForUser(@Param("userId") Long userId);
    
    // Thread mesajları (Ana mesaj + yanıtlar)
    @Query("SELECT m FROM Message m WHERE m.id = :messageId OR m.parentMessageId = :messageId ORDER BY m.createdAt ASC")
    List<Message> findThreadByMessageId(@Param("messageId") Long messageId);
    
    // Son mesajlar (Admin paneli için)
    @Query("SELECT m FROM Message m WHERE m.receiver.type = 'SUPER_ADMIN' OR m.sender.type = 'SUPER_ADMIN' ORDER BY m.createdAt DESC")
    List<Message> findAllMessagesForAdmin();
}