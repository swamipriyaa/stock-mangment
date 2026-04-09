package com.stock.management.service;

import com.stock.management.model.Watchlist;
import com.stock.management.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    /**
     * Gets the current user ID. 
     * If authentication is missing or anonymous (auth bypassed),
     * it falls back to a default test user.
     */
    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized: No valid identity found");
        }
        return auth.getName();
    }

    public List<String> getWatchlistSymbols() {
        return watchlistRepository.findByUserId(getCurrentUserId())
                .stream()
                .map(Watchlist::getSymbol)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWatchlist(String symbol) {
        String normalizedSymbol = symbol.trim().toUpperCase();
        String userId = getCurrentUserId();
        if (watchlistRepository.findByUserIdAndSymbol(userId, normalizedSymbol).isEmpty()) {
            watchlistRepository.save(Watchlist.builder()
                    .userId(userId)
                    .symbol(normalizedSymbol)
                    .createdAt(OffsetDateTime.now())
                    .build());
        }
    }

    @Transactional
    public void removeFromWatchlist(String symbol) {
        watchlistRepository.deleteByUserIdAndSymbol(getCurrentUserId(), symbol.trim().toUpperCase());
    }
}
