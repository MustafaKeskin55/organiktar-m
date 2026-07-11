package com.acillazim.organiktarm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OrganikTarimApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(OrganikTarimApplication.class, args);
    }
}
