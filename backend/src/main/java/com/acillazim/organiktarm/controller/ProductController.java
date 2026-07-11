package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.dto.ProductDTO;
import com.acillazim.organiktarm.service.ProductService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @GetMapping("/producer/{producerId}")
    public ResponseEntity<List<ProductDTO>> getProductsByProducer(@PathVariable @NonNull Long producerId) {
        return ResponseEntity.ok(productService.getProductsByProducer(producerId));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }
    
    @GetMapping("/filter")
    public ResponseEntity<List<ProductDTO>> getFilteredProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isOrganic,
            @RequestParam(required = false) Boolean isSeasonal) {
        return ResponseEntity.ok(productService.getFilteredProducts(category, search, isOrganic, isSeasonal));
    }
    
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody @NonNull ProductDTO dto, 
                                                      @RequestParam @NonNull Long producerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(dto, producerId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable @NonNull Long id, @RequestBody @NonNull ProductDTO dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable @NonNull Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    // Soft Delete - Ürünü pasife al
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateProduct(@PathVariable @NonNull Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
    
    // Ürünü tekrar aktife al
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateProduct(@PathVariable @NonNull Long id) {
        productService.activateProduct(id);
        return ResponseEntity.ok().build();
    }
    
    // Sadece aktif ürünleri getir (kullanıcılar için)
    @GetMapping("/active")
    public ResponseEntity<List<ProductDTO>> getAllActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }
    
    // Tüm ürünleri getir (admin için)
    @GetMapping("/all")
    public ResponseEntity<List<ProductDTO>> getAllProductsIncludingInactive() {
        return ResponseEntity.ok(productService.getAllProductsIncludingInactive());
    }
}
