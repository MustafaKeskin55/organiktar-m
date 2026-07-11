package com.acillazim.organiktarm.dto;

import com.acillazim.organiktarm.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private Double totalAmount;
    private Double deliveryFee;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDate estimatedDelivery;
    private Long addressId;
    private List<OrderItemDTO> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }
    
    public static OrderResponseDTO fromEntity(Order order) {
        if (order == null) return null;
        
        OrderResponseDTOBuilder builder = OrderResponseDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null)
                .createdAt(order.getCreatedAt())
                .estimatedDelivery(order.getEstimatedDelivery());
        
        // Safe null checks for related entities
        if (order.getUser() != null) {
            builder.userId(order.getUser().getId());
            builder.userName(order.getUser().getName());
            builder.userEmail(order.getUser().getEmail());
        }
        
        if (order.getAddress() != null) {
            builder.addressId(order.getAddress().getId());
        }
        
        if (order.getItems() != null) {
            builder.items(order.getItems().stream()
                    .map(item -> {
                        Double unitPrice = item.getPrice();
                        Integer qty = item.getQuantity();
                        return OrderItemDTO.builder()
                                .id(item.getId())
                                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                                .quantity(qty)
                                .unitPrice(unitPrice)
                                .totalPrice(unitPrice != null && qty != null ? unitPrice * qty : 0.0)
                                .build();
                    })
                    .collect(Collectors.toList()));
        }
        
        return builder.build();
    }
    
    public static List<OrderResponseDTO> fromEntityList(List<Order> orders) {
        if (orders == null) return List.of();
        return orders.stream()
                .map(OrderResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
