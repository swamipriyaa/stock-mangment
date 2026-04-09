package com.stock.management.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;

public class SupabaseIdentityFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");

            if (parts.length == 3) {
                try {
                    // Decode the payload (second part of the JWT)
                    String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                    JsonNode payloadJson = objectMapper.readTree(payload);

                    // Extract user identifier (email is typically sent by Supabase; sub is uuid)
                    String userEmail = null;
                    if (payloadJson.has("email")) {
                        userEmail = payloadJson.get("email").asText();
                    } else if (payloadJson.has("sub")) {
                        userEmail = payloadJson.get("sub").asText(); // fallback to UUID
                    }

                    if (userEmail != null && !userEmail.isEmpty()) {
                        // Set the user identity in the Spring Security context
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userEmail, null, Collections.emptyList());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to parse identity from generic JWT: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
