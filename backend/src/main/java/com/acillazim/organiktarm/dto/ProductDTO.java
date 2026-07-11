package com.acillazim.organiktarm.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private Double price;
    private String unit;
    private Integer stock;
    private List<String> images = new ArrayList<>();
    private Double rating;
    private Integer reviewCount;
    private Boolean isOrganic;
    private Boolean isSeasonal;
    private Boolean isActive;
    private LocalDate harvestDate;
    private Long producerId;
    private String producerName;
    private LocalDateTime createdAt;
}
