package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.OrderDTO;
import com.acillazim.organiktarm.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    // ========== ÜRÜN MESAJLARI ==========
    
    /**
     * Yeni ürün eklendiğinde tüm client'lara bildir
     */
    public void sendProductCreated(ProductDTO product) {
        messagingTemplate.convertAndSend("/topic/products", 
                new WebSocketMessage<>("PRODUCT_CREATED", product));
    }

    /**
     * Ürün güncellendiğinde tüm client'lara bildir
     */
    public void sendProductUpdated(ProductDTO product) {
        messagingTemplate.convertAndSend("/topic/products", 
                new WebSocketMessage<>("PRODUCT_UPDATED", product));
    }

    /**
     * Ürün pasife alındığında tüm client'lara bildir
     */
    public void sendProductDeactivated(Long productId) {
        messagingTemplate.convertAndSend("/topic/products", 
                new WebSocketMessage<>("PRODUCT_DEACTIVATED", productId));
    }

    /**
     * Ürün aktife alındığında tüm client'lara bildir
     */
    public void sendProductActivated(Long productId) {
        messagingTemplate.convertAndSend("/topic/products", 
                new WebSocketMessage<>("PRODUCT_ACTIVATED", productId));
    }

    // ========== SİPARİŞ MESAJLARI ==========
    
    /**
     * Yeni sipariş oluşturulduğunda ilgili kullanıcılara bildir
     */
    public void sendOrderCreated(OrderDTO order) {
        // Tüm admin'lere bildir
        messagingTemplate.convertAndSend("/topic/orders", 
                new WebSocketMessage<>("ORDER_CREATED", order));
        
        // Sipariş sahibine özel bildirim
        messagingTemplate.convertAndSend("/queue/orders/" + order.getUserId(), 
                new WebSocketMessage<>("ORDER_CREATED", order));
    }

    /**
     * Sipariş durumu değiştiğinde tüm ilgililere bildir
     */
    public void sendOrderStatusUpdated(OrderDTO order) {
        // Tüm admin'lere bildir
        messagingTemplate.convertAndSend("/topic/orders", 
                new WebSocketMessage<>("ORDER_STATUS_UPDATED", order));
        
        // Sipariş sahibine özel bildirim
        messagingTemplate.convertAndSend("/queue/orders/" + order.getUserId(), 
                new WebSocketMessage<>("ORDER_STATUS_UPDATED", order));
    }

    /**
     * Sipariş iptal edildiğinde tüm ilgililere bildir
     */
    public void sendOrderCancelled(OrderDTO order) {
        // Tüm admin'lere bildir
        messagingTemplate.convertAndSend("/topic/orders", 
                new WebSocketMessage<>("ORDER_CANCELLED", order));
        
        // Sipariş sahibine özel bildirim
        messagingTemplate.convertAndSend("/queue/orders/" + order.getUserId(), 
                new WebSocketMessage<>("ORDER_CANCELLED", order));
    }

    /**
     * Sipariş silindiğinde tüm ilgililere bildir
     */
    public void sendOrderDeleted(Long orderId) {
        // Tüm admin'lere bildir
        messagingTemplate.convertAndSend("/topic/orders", 
                new WebSocketMessage<>("ORDER_DELETED", Map.of("orderId", orderId)));
    }

    // ========== GENEL MESAJ YAPISI ==========
    
    public record WebSocketMessage<T>(String type, T data) {}
}
