package com.acillazim.organiktarm.service;

import com.acillazim.organiktarm.entity.Address;
import com.acillazim.organiktarm.entity.User;
import com.acillazim.organiktarm.repository.AddressRepository;
import com.acillazim.organiktarm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {
    
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    
    public List<Address> getAddressesByUserId(@NonNull Long userId) {
        return addressRepository.findByUserId(userId);
    }
    
    public Address getAddressById(@NonNull Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
    }
    
    @Transactional
    public @NonNull Address createAddress(@NonNull Address address, @NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        address.setUser(user);
        
        // If this is the first address or marked as default, update other addresses
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<Address> existingAddresses = addressRepository.findByUserId(userId);
            for (Address existing : existingAddresses) {
                existing.setIsDefault(false);
                addressRepository.save(existing);
            }
        }
        
        return java.util.Objects.requireNonNull(addressRepository.save(address));
    }
    
    @Transactional
    public @NonNull Address updateAddress(@NonNull Long id, @NonNull Address addressData, @NonNull Long userId) {
        Address existingAddress = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!existingAddress.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to user");
        }
        
        existingAddress.setTitle(addressData.getTitle());
        existingAddress.setCity(addressData.getCity());
        existingAddress.setDistrict(addressData.getDistrict());
        existingAddress.setNeighborhood(addressData.getNeighborhood());
        existingAddress.setFullAddress(addressData.getFullAddress());
        
        // Handle default address logic
        if (Boolean.TRUE.equals(addressData.getIsDefault())) {
            existingAddress.setIsDefault(true);
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            for (Address addr : userAddresses) {
                if (!addr.getId().equals(id)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            }
        } else {
            existingAddress.setIsDefault(false);
        }
        
        return java.util.Objects.requireNonNull(addressRepository.save(existingAddress));
    }
    
    @Transactional
    public void deleteAddress(@NonNull Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        addressRepository.delete(java.util.Objects.requireNonNull(address));
    }
}
