package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.dto.CouponCreateRequest;
import com.acillazim.organiktarm.entity.Coupon;
import com.acillazim.organiktarm.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon createCoupon(@NonNull CouponCreateRequest request) {
        return createCoupon(request, null);
    }

    public Coupon createCoupon(@NonNull CouponCreateRequest request, Long createdBy) {
        Coupon coupon = new Coupon();
        
        // Kod boşsa otomatik oluştur
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            coupon.setCode(generateUniqueCode());
        } else {
            coupon.setCode(request.getCode().toUpperCase());
        }
        
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(request.getDiscountType()));
        coupon.setDiscountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO);
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setPerUserLimit(request.getPerUserLimit() != null ? request.getPerUserLimit() : 1);
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setIsActive(true);
        coupon.setUsageCount(0);
        coupon.setCreatedBy(createdBy);
        coupon.setCreatedAt(LocalDateTime.now());
        
        return couponRepository.save(coupon);
    }

    public void deactivateCoupon(@NonNull Long couponId) {
        Coupon coupon = couponRepository.findById(couponId).orElseThrow();
        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    public Map<String, Object> validateCoupon(String code, BigDecimal orderAmount) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<Coupon> couponOpt = couponRepository.findByCode(code.toUpperCase());
        if (couponOpt.isEmpty()) {
            result.put("valid", false);
            result.put("message", "Kupon bulunamadı");
            return result;
        }
        
        Coupon coupon = couponOpt.get();
        
        if (!coupon.isValid()) {
            result.put("valid", false);
            result.put("message", "Kupon geçerli değil");
            return result;
        }
        
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            result.put("valid", false);
            result.put("message", "Minimum sipariş tutarı: " + coupon.getMinOrderAmount() + " TL");
            return result;
        }
        
        BigDecimal discount = coupon.calculateDiscount(orderAmount);
        
        result.put("valid", true);
        result.put("code", coupon.getCode());
        result.put("discountType", coupon.getDiscountType().name());
        result.put("discountValue", coupon.getDiscountValue());
        result.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
        result.put("discountAmount", discount);
        
        return result;
    }

    public Optional<Coupon> validateCoupon(@NonNull String code, Long userId, @NonNull BigDecimal orderAmount) {
        Optional<Coupon> couponOpt = couponRepository.findByCode(code.toUpperCase());
        if (couponOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Coupon coupon = couponOpt.get();
        
        if (!coupon.isValid()) {
            return Optional.empty();
        }
        
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return Optional.empty();
        }
        
        return Optional.of(coupon);
    }

    public @NonNull BigDecimal calculateDiscount(@NonNull Coupon coupon, @NonNull BigDecimal orderAmount) {
        return java.util.Objects.requireNonNull(coupon.calculateDiscount(orderAmount));
    }

    private String generateUniqueCode() {
        return "CPN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
