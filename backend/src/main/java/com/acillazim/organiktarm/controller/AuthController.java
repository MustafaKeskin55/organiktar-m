package com.acillazim.organiktarm.controller;

import com.acillazim.organiktarm.dto.UserDTO;
import com.acillazim.organiktarm.entity.User;
import com.acillazim.organiktarm.repository.UserRepository;
import com.acillazim.organiktarm.security.JwtService;
import com.acillazim.organiktarm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-posta ve şifre gerekli"));
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Geçersiz e-posta veya şifre"));
        }
        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword())
                || password.equals(user.getPassword());
        if (!passwordMatches) {
            return ResponseEntity.badRequest().body(Map.of("error", "Geçersiz e-posta veya şifre"));
        }
        if (user.getIsActive() != null && !user.getIsActive()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Hesabınız pasif durumda"));
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(
                userDetails,
                user.getId(),
                user.getType().name()
        );
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setType(user.getType().name().toLowerCase(Locale.ENGLISH));
        dto.setForcePasswordChange(user.getForcePasswordChange());
        boolean requiresPasswordChange = user.getForcePasswordChange() != null ? user.getForcePasswordChange() : false;
        return ResponseEntity.ok(Map.of(
                "data", dto,
                "token", jwtToken,
                "tokenType", "Bearer",
                "expiresIn", jwtService.getExpirationTime(),
                "requiresPasswordChange", requiresPasswordChange
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        try {
            UserDTO dto = new UserDTO();
            dto.setName(req.get("name"));
            dto.setEmail(req.get("email"));
            dto.setPassword(req.get("password"));
            dto.setPhone(req.get("phone"));
            String type = req.get("type");
            dto.setType(type != null && !type.isBlank() ? type : "consumer");
            UserDTO created = userService.createUser(dto);
            User user = userRepository.findByEmail(created.getEmail())
                    .orElseThrow(() -> new RuntimeException("Kayıt sonrası kullanıcı bulunamadı"));
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String jwtToken = jwtService.generateToken(
                    userDetails,
                    user.getId(),
                    user.getType().name()
            );
            return ResponseEntity.ok(Map.of(
                    "data", created,
                    "token", jwtToken,
                    "tokenType", "Bearer",
                    "expiresIn", jwtService.getExpirationTime()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-posta gerekli"));
        }
        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (userOpt.isPresent()) {
            try {
                userService.resetUserPassword(userOpt.get().getId());
            } catch (Exception ignored) {
                // Aynı mesajı dön; e-posta gönderilemese bile bilgi sızdırma
            }
        }
        return ResponseEntity.ok(Map.of(
                "message", "E-posta adresinize şifre sıfırlama bilgisi gönderildi"
        ));
    }
}
