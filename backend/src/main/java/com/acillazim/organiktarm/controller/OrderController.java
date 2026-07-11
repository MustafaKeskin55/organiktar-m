package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.dto.OrderResponseDTO;
import com.acillazim.organiktarm.entity.Order;
import com.acillazim.organiktarm.service.OrderService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            System.out.println("✅ getAllOrders: " + (orders != null ? orders.size() : 0) + " orders found");
            return ResponseEntity.ok(OrderResponseDTO.fromEntityList(orders));
        } catch (Exception e) {
            System.err.println("❌ getAllOrders ERROR: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable @NonNull Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(OrderResponseDTO.fromEntity(order));
    }
    
    @GetMapping("/consumer/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUser(@PathVariable @NonNull Long userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(OrderResponseDTO.fromEntityList(orders));
    }
    
    @GetMapping("/producer/{producerId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByProducer(@PathVariable @NonNull Long producerId) {
        List<Order> orders = orderService.getOrdersByProducer(producerId);
        return ResponseEntity.ok(OrderResponseDTO.fromEntityList(orders));
    }
    
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody Map<String, Object> request) {
        Order created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponseDTO.fromEntity(created));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable @NonNull Long id,
            @RequestParam @NonNull String status) {
        Order updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(OrderResponseDTO.fromEntity(updated));
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        long count = orderService.getTotalOrderCount();
        Double revenue = orderService.getTotalRevenue();
        return ResponseEntity.ok(Map.of(
                "total", count,
                "revenue", revenue != null ? revenue : 0.0
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable @NonNull Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
    }
    
    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, String>> deleteMultipleOrders(@RequestBody List<Long> ids) {
        orderService.deleteMultipleOrders(ids);
        return ResponseEntity.ok(Map.of("message", ids.size() + " orders deleted successfully"));
    }
}
