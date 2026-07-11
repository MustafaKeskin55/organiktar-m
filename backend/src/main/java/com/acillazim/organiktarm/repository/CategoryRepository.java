package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findBySlug(String slug);
    
    Optional<Category> findByName(String name);
    
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    List<Category> findAllByOrderByDisplayOrderAsc();
    
    boolean existsBySlug(String slug);
    
    boolean existsByName(String name);
    
    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.productCount DESC")
    List<Category> findPopularCategories();
}
