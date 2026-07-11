package com.acillazim.organiktarm.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String type;
    private Boolean isActive;
    private Boolean forcePasswordChange;
    private LocalDateTime createdAt;
    
    // Engagement & Commission fields
    private Double commissionRate;
    private LocalDateTime lastLoginDate;
    private Integer loginCount;
    private LocalDateTime registrationDate;
}
