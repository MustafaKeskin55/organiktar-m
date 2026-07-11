package com.acillazim.organiktarm.repository;

import com.acillazim.organiktarm.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByProducerId(Long producerId);
    
    List<Product> findByCategory(Product.Category category);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isOrganic IS NULL OR p.isOrganic = :isOrganic) AND " +
           "(:isSeasonal IS NULL OR p.isSeasonal = :isSeasonal)")
    List<Product> findFiltered(@Param("category") Product.Category category,
                               @Param("search") String search,
                               @Param("isOrganic") Boolean isOrganic,
                               @Param("isSeasonal") Boolean isSeasonal);
    
    @Query("SELECT p FROM Product p WHERE p.stock > 0 ORDER BY p.rating DESC")
    List<Product> findTopRatedAvailable();
    
    List<Product> findByIsOrganicTrue();
    
    List<Product> findByIsSeasonalTrue();
    
    List<Product> findByIsActive(Boolean isActive);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:isOrganic IS NULL OR p.isOrganic = :isOrganic) AND " +
           "(:isSeasonal IS NULL OR p.isSeasonal = :isSeasonal) AND " +
           "p.isActive = true")
    List<Product> findFilteredActive(@Param("category") Product.Category category,
                                     @Param("search") String search,
                                     @Param("isOrganic") Boolean isOrganic,
                                     @Param("isSeasonal") Boolean isSeasonal);
}
