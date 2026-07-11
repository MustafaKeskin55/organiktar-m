package com.acillazim.organiktarm.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long addressId;
    private String addressTitle;
    private List<OrderItemDTO> items;
    private Double totalAmount;
    private Double deliveryFee;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDate estimatedDelivery;
    
    @Data
    public static class OrderItemDTO {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double price;
    }
}
