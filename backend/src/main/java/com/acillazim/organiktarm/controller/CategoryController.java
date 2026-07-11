package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.entity.Category;
import com.acillazim.organiktarm.service.CategoryService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        if (includeInactive) {
            return ResponseEntity.ok(categoryService.getAllCategories());
        }
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<Category> getCategoryBySlug(@PathVariable @NonNull String slug) {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }
    
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody @NonNull Category category) {
        @NonNull Category created = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable @NonNull Long id, @RequestBody @NonNull Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable @NonNull Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
