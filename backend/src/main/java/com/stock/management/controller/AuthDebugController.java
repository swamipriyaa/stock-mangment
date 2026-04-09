package com.stock.management.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * TEMPORARY debug controller - remove after auth is working.
 * This endpoint is public (permitAll via /api/auth/** in SecurityConfig).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthDebugController {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @GetMapping("/debug-token")
    public ResponseEntity<Map<String, Object>> debugToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> result = new HashMap<>();

        result.put("jwksUri", supabaseUrl + "/auth/v1/.well-known/jwks.json");
        result.put("signingAlgorithm", "ES256 (Elliptic Curve P-256) - Asymmetric");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            result.put("error", "No Bearer token found in Authorization header");
            result.put("authHeaderPresent", authHeader != null);
            return ResponseEntity.ok(result);
        }

        String token = authHeader.substring(7);
        String[] parts = token.split("\\.");

        result.put("tokenPartsCount", parts.length);
        result.put("tokenLength", token.length());

        if (parts.length != 3) {
            result.put("error", "Invalid JWT structure - expected 3 parts, got " + parts.length);
            return ResponseEntity.ok(result);
        }

        try {
            // Decode header
            String header = new String(Base64.getUrlDecoder().decode(parts[0]));
            result.put("jwtHeader", header);

            // Decode payload (partial for security)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            result.put("jwtPayload", payload.substring(0, Math.min(payload.length(), 300)));

            result.put("status", "token_parsed_successfully");
        } catch (Exception e) {
            result.put("error", "Failed to parse token: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> result = new HashMap<>();
        result.put("status", "ok");
        result.put("jwksUri", supabaseUrl + "/auth/v1/.well-known/jwks.json");
        return ResponseEntity.ok(result);
    }
}
