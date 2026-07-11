package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.OrderDTO;
import com.acillazim.organiktarm.dto.ProducerEarningsDTO;
import com.acillazim.organiktarm.entity.*;
import com.acillazim.organiktarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final WebSocketService webSocketService;
    private final SiteSettingsRepository siteSettingsRepository;
    
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        // Force load related entities to avoid LazyInitializationException
        orders.forEach(order -> {
            if (order.getUser() != null) order.getUser().getName();
            if (order.getItems() != null) order.getItems().size();
        });
        return orders;
    }
    
    @Transactional(readOnly = true)
    public Order getOrderById(@NonNull Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(@NonNull Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Order> getOrdersByProducer(@NonNull Long producerId) {
        return orderRepository.findByProducerId(producerId);
    }
    
    @Transactional
    @SuppressWarnings("unchecked")
    public Order createOrder(Map<String, Object> request) {
        Long userId = java.util.Objects.requireNonNull(Long.valueOf(request.get("userId").toString()));
        Long addressId = java.util.Objects.requireNonNull(Long.valueOf(request.get("addressId").toString()));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        Order order = new Order();
        order.setUser(user);
        order.setAddress(address);
        order.setPaymentMethod(Order.PaymentMethod.valueOf((String) request.get("paymentMethod")));
        order.setDeliveryFee(Double.valueOf(request.getOrDefault("deliveryFee", 0.0).toString()));
        
        // Calculate total and create order items
        double total = 0.0;
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
        
        if (items != null) {
            for (Map<String, Object> itemData : items) {
                Long productId = java.util.Objects.requireNonNull(Long.valueOf(itemData.get("productId").toString()));
                Integer quantity = Integer.valueOf(itemData.get("quantity").toString());
                
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                
                if (product.getStock() < quantity) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }
                
                // Decrease stock
                product.setStock(product.getStock() - quantity);
                productRepository.save(product);
                
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(quantity);
                orderItem.setPrice(product.getPrice());
                
                order.getItems().add(orderItem);
                total += product.getPrice() * quantity;
            }
        }
        
        order.setTotalAmount(total + order.getDeliveryFee());
        
        Order saved = orderRepository.save(order);
        
        // WebSocket ile tüm ilgililere bildir
        OrderDTO dto = convertToDTO(saved);
        webSocketService.sendOrderCreated(dto);
        
        return saved;
    }
    
    @Transactional
    public Order updateOrderStatus(@NonNull Long id, @NonNull String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status));
        Order saved = orderRepository.save(order);
        
        // WebSocket ile tüm ilgililere bildir
        OrderDTO dto = convertToDTO(saved);
        
        if ("IPTAL_EDILDI".equals(status)) {
            webSocketService.sendOrderCancelled(dto);
        } else {
            webSocketService.sendOrderStatusUpdated(dto);
        }
        
        return saved;
    }
    
    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserName(order.getUser().getName());
        dto.setAddressId(order.getAddress().getId());
        dto.setAddressTitle(order.getAddress().getTitle());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod().name());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setEstimatedDelivery(order.getEstimatedDelivery());
        
        // Order items
        List<OrderDTO.OrderItemDTO> itemDTOs = order.getItems().stream().map(item -> {
            OrderDTO.OrderItemDTO itemDTO = new OrderDTO.OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setProductImage(item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty() 
                    ? item.getProduct().getImages().get(0) : null);
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            return itemDTO;
        }).collect(Collectors.toList());
        dto.setItems(itemDTOs);
        
        return dto;
    }
    
    public long getTotalOrderCount() {
        return orderRepository.count();
    }
    
    public Double getTotalRevenue() {
        Double revenue = orderRepository.sumTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
    
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
    }
    
    @Transactional
    public void deleteOrder(@NonNull Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // If order is cancelled, restore product stock
        if (order.getStatus() == Order.OrderStatus.IPTAL_EDILDI) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
        
        // Delete the order (cascade will delete order items)
        orderRepository.delete(order);
        
        // WebSocket notification
        webSocketService.sendOrderDeleted(id);
    }
    
    @Transactional
    public void deleteMultipleOrders(List<Long> ids) {
        for (Long id : ids) {
            if (id != null) {
                deleteOrder(id);
            }
        }
    }
    
    @Transactional(readOnly = true)
    public ProducerEarningsDTO getProducerEarnings(@NonNull Long producerId) {
        User producer = userRepository.findById(producerId)
                .orElseThrow(() -> new RuntimeException("Producer not found"));
        
        // Site settings'ten komisyon oranını al
        BigDecimal commissionRate = siteSettingsRepository.findFirstByOrderByIdAsc()
                .map(settings -> settings.getCommissionRate())
                .orElse(new BigDecimal("5.00")); // Varsayılan %5
        
        // Üreticiye ait tüm siparişleri bul
        List<Order> producerOrders = orderRepository.findByProducerId(producerId);
        
        // Sipariş istatistikleri
        int totalOrders = producerOrders.size();
        int completedOrders = (int) producerOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.TESLIM_EDILDI)
                .count();
        int cancelledOrders = (int) producerOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.IPTAL_EDILDI)
                .count();
        int pendingOrders = (int) producerOrders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.TESLIM_EDILDI 
                        && o.getStatus() != Order.OrderStatus.IPTAL_EDILDI)
                .count();
        
        // Finansal hesaplamalar (sadece tamamlanan siparişler)
        BigDecimal grossRevenue = producerOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.TESLIM_EDILDI)
                .map(o -> {
                    Double amount = o.getTotalAmount();
                    return BigDecimal.valueOf(amount != null ? amount : 0.0);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCommission = grossRevenue
                .multiply(commissionRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        BigDecimal netRevenue = grossRevenue.subtract(totalCommission);
        
        // Aylık kazanç verisi (son 6 ay)
        List<ProducerEarningsDTO.MonthlyEarning> monthlyEarnings = calculateMonthlyEarnings(
                producerOrders, commissionRate);
        
        // Ürün bazlı kazanç (top 5)
        List<ProducerEarningsDTO.ProductEarning> topProducts = calculateProductEarnings(
                producerOrders, commissionRate);
        
        return ProducerEarningsDTO.builder()
                .producerId(producerId)
                .producerName(producer.getName())
                .commissionRate(commissionRate)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .pendingOrders(pendingOrders)
                .grossRevenue(grossRevenue)
                .totalCommission(totalCommission)
                .netRevenue(netRevenue)
                .shippingRevenue(BigDecimal.ZERO)
                .monthlyEarnings(monthlyEarnings)
                .topProducts(topProducts)
                .pendingPayment(netRevenue) // Tüm net kazanç bekleyen ödeme olarak varsay
                .lastPayment(BigDecimal.ZERO)
                .lastPaymentDate(null)
                .build();
    }
    
    private List<ProducerEarningsDTO.MonthlyEarning> calculateMonthlyEarnings(
            List<Order> orders, BigDecimal commissionRate) {
        
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMMM yyyy", new Locale("tr"));
        
        // Son 6 ayın verisi
        LocalDate now = LocalDate.now();
        Map<String, ProducerEarningsDTO.MonthlyEarning> earningsMap = new LinkedHashMap<>();
        
        // Son 6 ay için boş kayıtlar oluştur
        for (int i = 5; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            String key = date.getYear() + "-" + date.getMonthValue();
            String monthName = date.format(monthFormatter);
            
            earningsMap.put(key, ProducerEarningsDTO.MonthlyEarning.builder()
                    .month(monthName.substring(0, 1).toUpperCase() + monthName.substring(1))
                    .year(date.getYear())
                    .monthValue(date.getMonthValue())
                    .grossRevenue(BigDecimal.ZERO)
                    .commission(BigDecimal.ZERO)
                    .netRevenue(BigDecimal.ZERO)
                    .orderCount(0)
                    .build());
        }
        
        // Siparişleri aylara göre grupla ve hesapla (sadece tamamlananlar)
        for (Order order : orders) {
            if (order.getStatus() != Order.OrderStatus.TESLIM_EDILDI) continue;
            
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            String key = orderDate.getYear() + "-" + orderDate.getMonthValue();
            
            ProducerEarningsDTO.MonthlyEarning earning = earningsMap.get(key);
            if (earning != null) {
                BigDecimal amount = BigDecimal.valueOf(order.getTotalAmount());
                BigDecimal commission = amount.multiply(commissionRate)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                
                earning.setGrossRevenue(earning.getGrossRevenue().add(amount));
                earning.setCommission(earning.getCommission().add(commission));
                earning.setNetRevenue(earning.getNetRevenue().add(amount.subtract(commission)));
                earning.setOrderCount(earning.getOrderCount() + 1);
            }
        }
        
        return new ArrayList<>(earningsMap.values());
    }
    
    private List<ProducerEarningsDTO.ProductEarning> calculateProductEarnings(
            List<Order> orders, BigDecimal commissionRate) {
        
        Map<Long, ProducerEarningsDTO.ProductEarning> productMap = new HashMap<>();
        
        for (Order order : orders) {
            if (order.getStatus() != Order.OrderStatus.TESLIM_EDILDI) continue;
            
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                Long productId = product.getId();
                
                BigDecimal itemTotal = BigDecimal.valueOf(item.getPrice() * item.getQuantity());
                BigDecimal commission = itemTotal.multiply(commissionRate)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                
                ProducerEarningsDTO.ProductEarning earning = productMap.computeIfAbsent(
                        productId, id -> ProducerEarningsDTO.ProductEarning.builder()
                                .productId(productId)
                                .productName(product.getName())
                                .productImage(product.getImages() != null && !product.getImages().isEmpty() 
                                        ? product.getImages().get(0) : null)
                                .quantitySold(0)
                                .grossRevenue(BigDecimal.ZERO)
                                .commission(BigDecimal.ZERO)
                                .netRevenue(BigDecimal.ZERO)
                                .build());
                
                earning.setQuantitySold(earning.getQuantitySold() + item.getQuantity());
                earning.setGrossRevenue(earning.getGrossRevenue().add(itemTotal));
                earning.setCommission(earning.getCommission().add(commission));
                earning.setNetRevenue(earning.getNetRevenue().add(itemTotal.subtract(commission)));
            }
        }
        
        // Net kazanca göre sırala ve top 5'i al
        return productMap.values().stream()
                .sorted((a, b) -> b.getNetRevenue().compareTo(a.getNetRevenue()))
                .limit(5)
                .collect(Collectors.toList());
    }
}
