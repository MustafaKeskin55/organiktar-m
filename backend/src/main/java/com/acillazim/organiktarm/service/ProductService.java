package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.ProductDTO;
import com.acillazim.organiktarm.entity.Product;
import com.acillazim.organiktarm.entity.User;
import com.acillazim.organiktarm.repository.ProductRepository;
import com.acillazim.organiktarm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ProductDTO getProductById(@NonNull Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı: " + id));
        return convertToDTO(product);
    }
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByProducer(@NonNull Long producerId) {
        return productRepository.findByProducerId(producerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByCategory(String category) {
        Product.Category cat = Product.Category.valueOf(category.toUpperCase());
        return productRepository.findByCategory(cat).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getFilteredProducts(String category, String search, Boolean isOrganic, Boolean isSeasonal) {
        Product.Category cat = null;
        if (category != null && !category.isEmpty()) {
            cat = Product.Category.valueOf(category.toUpperCase());
        }
        return productRepository.findFiltered(cat, search, isOrganic, isSeasonal).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProductDTO createProduct(@NonNull ProductDTO dto, @NonNull Long producerId) {
        User producer = userRepository.findById(producerId)
                .orElseThrow(() -> new RuntimeException("Üretici bulunamadı: " + producerId));
        
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setCategory(Product.Category.valueOf(dto.getCategory().toUpperCase()));
        product.setPrice(dto.getPrice());
        product.setUnit(dto.getUnit());
        product.setStock(dto.getStock());
        product.setImages(dto.getImages());
        product.setIsOrganic(dto.getIsOrganic());
        product.setIsSeasonal(dto.getIsSeasonal());
        product.setHarvestDate(dto.getHarvestDate());
        product.setProducer(producer);
        product.setRating(0.0);
        product.setReviewCount(0);
        
        Product saved = productRepository.save(product);
        ProductDTO result = convertToDTO(saved);
        
        // WebSocket ile tüm client'lara bildir
        webSocketService.sendProductCreated(result);
        
        return result;
    }
    
    @Transactional
    public ProductDTO updateProduct(@NonNull Long id, @NonNull ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı: " + id));
        
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        if (dto.getCategory() != null) {
            product.setCategory(Product.Category.valueOf(dto.getCategory().toUpperCase()));
        }
        product.setPrice(dto.getPrice());
        product.setUnit(dto.getUnit());
        product.setStock(dto.getStock());
        if (dto.getImages() != null) {
            product.setImages(dto.getImages());
        }
        product.setIsOrganic(dto.getIsOrganic());
        product.setIsSeasonal(dto.getIsSeasonal());
        product.setHarvestDate(dto.getHarvestDate());
        
        Product updated = productRepository.save(product);
        ProductDTO result = convertToDTO(updated);
        
        // WebSocket ile tüm client'lara bildir
        webSocketService.sendProductUpdated(result);
        
        return result;
    }
    
    @Transactional
    public void deleteProduct(@NonNull Long id) {
        // Soft delete - ürünü pasife al
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı: " + id));
        product.setIsActive(false);
        productRepository.save(product);
        
        // WebSocket ile tüm client'lara bildir
        webSocketService.sendProductDeactivated(id);
    }
    
    @Transactional
    public void activateProduct(@NonNull Long id) {
        // Ürünü tekrar aktife al
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı: " + id));
        product.setIsActive(true);
        productRepository.save(product);
        
        // WebSocket ile tüm client'lara bildir
        webSocketService.sendProductActivated(id);
    }
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllActiveProducts() {
        // Sadece aktif ürünleri getir (kullanıcılar için)
        return productRepository.findByIsActive(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProductsIncludingInactive() {
        // Tüm ürünleri getir (admin için)
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory().name().toLowerCase());
        dto.setPrice(product.getPrice());
        dto.setUnit(product.getUnit());
        dto.setStock(product.getStock());
        dto.setImages(product.getImages());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setIsOrganic(product.getIsOrganic());
        dto.setIsSeasonal(product.getIsSeasonal());
        dto.setIsActive(product.getIsActive());
        dto.setHarvestDate(product.getHarvestDate());
        dto.setProducerId(product.getProducer().getId());
        dto.setProducerName(product.getProducer().getName());
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }
}
