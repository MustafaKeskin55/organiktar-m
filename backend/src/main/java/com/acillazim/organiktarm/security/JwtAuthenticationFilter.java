package com.acillazim.organiktarm.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Check if Authorization header is present and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtService.extractUsername(jwt);

            // Check if user is not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Validate token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Get role from token and add to authorities
                    String userRole = jwtService.extractUserRole(jwt);
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    // Role already has ROLE_ prefix from JWT (set by JwtService)
                    // Use directly without adding another prefix
                    if (userRole != null && !userRole.isEmpty()) {
                        String authority = userRole.toUpperCase();
                        authorities.add(new SimpleGrantedAuthority(authority));
                        // DEBUG: Log yetkilendirme bilgisi
                        System.out.println("[JWT FILTER] User: " + userEmail + " Role: " + userRole + " Authority: " + authority);
                    } else {
                        System.out.println("[JWT FILTER] WARNING: No role found in token for user: " + userEmail);
                    }
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    // DEBUG: Authentication set edildi mi kontrol et
                    System.out.println("[JWT FILTER] Authentication SET for: " + userEmail + " with authorities: " + authorities);
                } else {
                    System.out.println("[JWT FILTER] Token INVALID for user: " + userEmail);
                }
            }
        } catch (ExpiredJwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token expired");
            return;
        } catch (JwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Public endpoints - no JWT filter needed
        if (path.startsWith("/api/auth/")) {
            return true;
        }
        if (path.startsWith("/api/products") && method.equals("GET")) {
            return true;
        }
        if (path.startsWith("/api/categories") && method.equals("GET")) {
            return true;
        }
        if (path.startsWith("/api/site-content/")) {
            return true;
        }
        if (path.startsWith("/api/producers") && method.equals("GET")) {
            return true;
        }
        // OPTIONS requests (CORS preflight)
        if (method.equals("OPTIONS")) {
            return true;
        }
        return false;
    }
}
