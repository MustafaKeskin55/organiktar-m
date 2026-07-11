package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.entity.Address;
import com.acillazim.organiktarm.service.AddressService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {
    
    private final AddressService addressService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getAddressesByUser(@PathVariable @NonNull Long userId) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddressById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(addressService.getAddressById(id));
    }
    
    @PostMapping
    public ResponseEntity<Address> createAddress(@RequestBody Map<String, Object> request) {
        Long userId = java.util.Objects.requireNonNull(Long.valueOf(request.get("userId").toString()));
        
        Address address = new Address();
        address.setTitle((String) request.get("title"));
        address.setCity((String) request.get("city"));
        address.setDistrict((String) request.get("district"));
        address.setNeighborhood((String) request.get("neighborhood"));
        address.setFullAddress((String) request.get("fullAddress"));
        address.setIsDefault((Boolean) request.getOrDefault("isDefault", false));
        
        Address created = addressService.createAddress(address, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable @NonNull Long id,
            @RequestBody Map<String, Object> request) {
        Long userId = java.util.Objects.requireNonNull(Long.valueOf(request.get("userId").toString()));
        
        Address addressData = new Address();
        addressData.setTitle((String) request.get("title"));
        addressData.setCity((String) request.get("city"));
        addressData.setDistrict((String) request.get("district"));
        addressData.setNeighborhood((String) request.get("neighborhood"));
        addressData.setFullAddress((String) request.get("fullAddress"));
        addressData.setIsDefault((Boolean) request.getOrDefault("isDefault", false));
        
        Address updated = addressService.updateAddress(id, addressData, userId);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable @NonNull Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
