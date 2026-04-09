package com.stock.management.service;

import com.stock.management.model.Alert;
import com.stock.management.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;

    /**
     * Gets current user ID with fallback.
     */
    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized: No valid identity found");
        }
        return auth.getName();
    }

    public List<Alert> getUserAlerts() {
        return alertRepository.findByUserId(getCurrentUserId());
    }

    @Transactional
    public void createAlert(String symbol, BigDecimal targetPrice, String condition) {
        alertRepository.save(Alert.builder()
                .userId(getCurrentUserId())
                .symbol(symbol.toUpperCase())
                .targetPrice(targetPrice)
                .condition(condition.toUpperCase())
                .isTriggered(false)
                .createdAt(OffsetDateTime.now())
                .build());
    }

    @Transactional
    public void deleteAlert(Long id) {
        alertRepository.deleteById(id);
    }

    @Transactional
    public void checkAlerts(String symbol, BigDecimal currentPrice) {
        List<Alert> activeAlerts = alertRepository.findBySymbolAndIsTriggeredFalse(symbol.toUpperCase());
        
        for (Alert alert : activeAlerts) {
            boolean triggered = false;
            if ("ABOVE".equals(alert.getCondition())) {
                triggered = currentPrice.compareTo(alert.getTargetPrice()) >= 0;
            } else if ("BELOW".equals(alert.getCondition())) {
                triggered = currentPrice.compareTo(alert.getTargetPrice()) <= 0;
            }

            if (triggered) {
                log.info("🔔 ALERT TRIGGERED: {} for User {} at Price {}", symbol, alert.getUserId(), currentPrice);
                alert.setIsTriggered(true);
                alertRepository.save(alert);
            }
        }
    }
}
