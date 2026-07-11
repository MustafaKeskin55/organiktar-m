package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.entity.SiteContent;
import com.acillazim.organiktarm.service.SiteContentService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site-content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SiteContentController {
    
    private final SiteContentService siteContentService;
    
    @GetMapping
    public ResponseEntity<List<SiteContent>> getAllContent() {
        return ResponseEntity.ok(siteContentService.getAllActiveContent());
    }
    
    @GetMapping("/{contentKey}")
    public ResponseEntity<JsonNode> getContentByKey(@PathVariable String contentKey) {
        SiteContent content = siteContentService.getContentByKey(contentKey);
        return ResponseEntity.ok(siteContentService.parseContentData(content));
    }
    
    @GetMapping("/type/{contentType}")
    public ResponseEntity<List<SiteContent>> getContentByType(@PathVariable String contentType) {
        return ResponseEntity.ok(siteContentService.getContentByType(contentType));
    }
    
    @GetMapping("/hero-stats")
    public ResponseEntity<Map<String, Object>> getHeroStats() {
        SiteContent content = siteContentService.getContentByKey("hero_stats");
        JsonNode data = siteContentService.parseContentData(content);
        
        Map<String, Object> response = new HashMap<>();
        response.put("stats", data.get("stats"));
        response.put("floating_badge", data.get("floating_badge"));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/how-it-works")
    public ResponseEntity<JsonNode> getHowItWorks() {
        SiteContent content = siteContentService.getContentByKey("how_it_works");
        return ResponseEntity.ok(siteContentService.parseContentData(content));
    }
    
    @GetMapping("/testimonials")
    public ResponseEntity<JsonNode> getTestimonials() {
        SiteContent content = siteContentService.getContentByKey("testimonials");
        return ResponseEntity.ok(siteContentService.parseContentData(content));
    }
    
    @GetMapping("/subscription-plans")
    public ResponseEntity<JsonNode> getSubscriptionPlans() {
        SiteContent content = siteContentService.getContentByKey("subscription_plans");
        return ResponseEntity.ok(siteContentService.parseContentData(content));
    }
    
    @GetMapping("/chatbot")
    public ResponseEntity<JsonNode> getChatbotConfig() {
        SiteContent content = siteContentService.getContentByKey("chatbot_responses");
        return ResponseEntity.ok(siteContentService.parseContentData(content));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SiteContent> updateContent(
            @PathVariable @NonNull Long id,
            @RequestBody @NonNull String contentData) {
        return ResponseEntity.ok(siteContentService.updateContent(id, contentData));
    }
}
