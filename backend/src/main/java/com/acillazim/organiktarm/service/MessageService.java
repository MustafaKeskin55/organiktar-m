package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.Message;
import com.acillazim.organiktarm.entity.User;
import com.acillazim.organiktarm.repository.MessageRepository;
import com.acillazim.organiktarm.repository.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message sendMessageToAdmin(@NonNull Long senderId, String subject, String content) {
        @NonNull User admin = userRepository.findByType(User.UserType.SUPER_ADMIN).stream().findFirst().orElseThrow();
        
        Message message = new Message();
        message.setSender(userRepository.findById(senderId).orElseThrow());
        message.setReceiver(admin);
        message.setSubject(subject);
        message.setContent(content);
        message.setMessageType(Message.MessageType.SUPPORT);
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());
        
        return messageRepository.save(message);
    }

    public Message replyToMessage(Long parentMessageId, String content) {
        return replyToMessage(null, parentMessageId, content);
    }
    
    public Message replyToMessage(Long adminId, @NonNull Long parentMessageId, String content) {
        @NonNull Message parentMessage = messageRepository.findById(parentMessageId).orElseThrow();
        
        User admin;
        if (adminId != null) {
            admin = userRepository.findById(adminId).orElseThrow();
        } else {
            // Admin belirtilmemişse, parent mesajın receiver'ı admin olmalı
            admin = parentMessage.getReceiver();
        }
        
        Message reply = new Message();
        reply.setSender(admin); // Admin yanıtlıyor
        reply.setReceiver(parentMessage.getSender()); // Kullanıcıya gidiyor
        reply.setSubject("Re: " + parentMessage.getSubject());
        reply.setContent(content);
        reply.setMessageType(Message.MessageType.REPLY);
        reply.setParentMessage(parentMessage);
        reply.setRelatedOrderId(parentMessage.getRelatedOrderId());
        reply.setRead(false);
        reply.setCreatedAt(LocalDateTime.now());
        
        Message saved = messageRepository.save(reply);
        
        // Ana mesajı okundu olarak işaretle
        parentMessage.setRead(true);
        parentMessage.setReadAt(LocalDateTime.now());
        messageRepository.save(parentMessage);
        
        return saved;
    }

    public List<Message> getAllMessagesForAdmin() {
        return getAllMessagesForAdmin(null);
    }
    
    public List<Message> getAllMessagesForAdmin(Long adminId) {
        if (adminId != null) {
            return messageRepository.findMessagesToAdmin(adminId);
        }
        // Find first SUPER_ADMIN to use as receiver
        User admin = userRepository.findByType(User.UserType.SUPER_ADMIN)
            .stream().findFirst().orElse(null);
        if (admin != null) {
            return messageRepository.findMessagesToAdmin(admin.getId());
        }
        return messageRepository.findMessagesToAdmin();
    }

    public List<Message> getUserMessages(Long userId) {
        return messageRepository.findBySenderIdToAdmin(userId);
    }

    public List<Message> getUserReplies(Long userId) {
        return messageRepository.findAdminRepliesForUser(userId);
    }

    public List<Message> getMessageThread(Long messageId) {
        return messageRepository.findThreadByMessageId(messageId);
    }

    public int getUnreadCountForAdmin() {
        return getUnreadCountForAdmin(null);
    }
    
    public int getUnreadCountForAdmin(Long adminId) {
        Long count;
        if (adminId != null) {
            count = messageRepository.countUnreadMessagesForAdmin(adminId);
        } else {
            // Find first SUPER_ADMIN to use as receiver
            User admin = userRepository.findByType(User.UserType.SUPER_ADMIN)
                .stream().findFirst().orElse(null);
            if (admin != null) {
                count = messageRepository.countUnreadMessagesForAdmin(admin.getId());
            } else {
                count = messageRepository.countUnreadMessagesForAdmin();
            }
        }
        return count != null ? count.intValue() : 0;
    }

    public int getUnreadRepliesForUser(@NonNull Long userId) {
        Long count = messageRepository.countUnreadRepliesForUser(userId);
        return count != null ? count.intValue() : 0;
    }

    public void markAsRead(@NonNull Long messageId) {
        Message message = messageRepository.findById(messageId).orElseThrow();
        message.setRead(true);
        message.setReadAt(LocalDateTime.now());
        messageRepository.save(message);
    }
}
