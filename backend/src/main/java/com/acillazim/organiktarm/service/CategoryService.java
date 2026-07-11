package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.Category;
import com.acillazim.organiktarm.repository.CategoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    // Varsayılan kategori verileri - sadece ilk kurulumda kullanılır
    private static final Map<String, CategoryData> DEFAULT_CATEGORIES = Map.of(
        "sebze", new CategoryData("Sebze", "Taze sebzeler", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", 1),
        "meyve", new CategoryData("Meyve", "Mevsim meyveleri", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", 2),
        "et-urunleri", new CategoryData("Et Ürünleri", "Doğal et ürünleri", "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400", 3),
        "sut-urunleri", new CategoryData("Süt Ürünleri", "Taze süt ürünleri", "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", 4),
        "baharat", new CategoryData("Baharat", "Doğal baharatlar", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", 5),
        "bakliyat", new CategoryData("Bakliyat", "Bakliyat ürünleri", "https://images.unsplash.com/photo-1515543909159-80a74f035e02?w=400", 6),
        "zeytinyagi", new CategoryData("Zeytinyağı", "Doğal zeytinyağı", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", 7),
        "bal", new CategoryData("Bal", "Doğal bal", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400", 8),
        "diger", new CategoryData("Diğer", "Diğer ürünler", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400", 99)
    );
    
    @PostConstruct
    @Transactional
    public void initDefaultCategories() {
        // Veritabanı boşsa varsayılan kategorileri oluştur
        if (categoryRepository.count() == 0) {
            DEFAULT_CATEGORIES.forEach((slug, data) -> {
                Category category = new Category();
                category.setSlug(slug);
                category.setName(data.name());
                category.setDescription(data.description());
                category.setImageUrl(data.imageUrl());
                category.setDisplayOrder(data.displayOrder());
                category.setIsActive(true);
                category.setProductCount(0);
                categoryRepository.save(category);
            });
        }
    }
    
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }
    
    @Transactional(readOnly = true)
    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }
    
    @Transactional(readOnly = true)
    public Category getCategoryById(@NonNull Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
    
    @Transactional(readOnly = true)
    public Category getCategoryBySlug(@NonNull String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
    
    @Transactional
    public @NonNull Category createCategory(@NonNull Category category) {
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new RuntimeException("Category with this slug already exists");
        }
        return categoryRepository.save(category);
    }
    
    @Transactional
    public @NonNull Category updateCategory(@NonNull Long id, @NonNull Category categoryData) {
        Category category = getCategoryById(id);
        
        if (categoryData.getName() != null) {
            category.setName(categoryData.getName());
        }
        if (categoryData.getDescription() != null) {
            category.setDescription(categoryData.getDescription());
        }
        if (categoryData.getImageUrl() != null) {
            category.setImageUrl(categoryData.getImageUrl());
        }
        if (categoryData.getIconName() != null) {
            category.setIconName(categoryData.getIconName());
        }
        if (categoryData.getDisplayOrder() != null) {
            category.setDisplayOrder(categoryData.getDisplayOrder());
        }
        if (categoryData.getIsActive() != null) {
            category.setIsActive(categoryData.getIsActive());
        }
        
        Category saved = categoryRepository.save(category);
        return saved != null ? saved : category;
    }
    
    @Transactional
    public void deleteCategory(@NonNull Long id) {
        categoryRepository.deleteById(id);
    }
    
    @Transactional
    public void updateProductCount(@NonNull String slug, int count) {
        categoryRepository.findBySlug(slug).ifPresent(category -> {
            category.setProductCount(count);
            categoryRepository.save(category);
        });
    }
    
    // Yardımcı record
    private record CategoryData(String name, String description, String imageUrl, int displayOrder) {}
}
