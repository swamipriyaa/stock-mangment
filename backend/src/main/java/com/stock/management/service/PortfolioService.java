package com.stock.management.service;

import com.stock.management.model.PortfolioHolding;
import com.stock.management.model.StockCurrent;
import com.stock.management.repository.PortfolioRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final StockService stockService;

    /**
     * Gets the current user ID. 
     * Falls back to default user if auth is bypassed.
     */
    private String getCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized: No valid identity found");
        }
        return auth.getName();
    }

    @Data
    @Builder
    public static class PortfolioSummary {
        private String symbol;
        private BigDecimal quantity;
        private BigDecimal avgBuyPrice;
        private BigDecimal currentPrice;
        private BigDecimal totalValue;
        private BigDecimal profitLoss;
        private BigDecimal profitLossPercent;
    }

    public List<PortfolioSummary> getPortfolio() {
        String userId = getCurrentUserId();
        List<PortfolioHolding> holdings = portfolioRepository.findByUserId(userId);

        return holdings.stream()
                .collect(Collectors.groupingBy(PortfolioHolding::getSymbol))
                .entrySet().stream()
                .map(entry -> {
                    String symbol = entry.getKey();
                    List<PortfolioHolding> symbolHoldings = entry.getValue();

                    BigDecimal totalQuantity = symbolHoldings.stream()
                            .map(PortfolioHolding::getQuantity)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalCost = symbolHoldings.stream()
                            .map(h -> h.getBuyPrice().multiply(h.getQuantity()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal avgBuyPrice = totalCost.divide(totalQuantity, 4, RoundingMode.HALF_UP);

                    StockCurrent current = stockService.getOrFetchStock(symbol);
                    BigDecimal currentValue = current.getPrice().multiply(totalQuantity);
                    BigDecimal profitLoss = currentValue.subtract(totalCost);
                    
                    BigDecimal profitLossPercent = BigDecimal.ZERO;
                    if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
                        profitLossPercent = profitLoss.divide(totalCost, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));
                    }

                    return PortfolioSummary.builder()
                            .symbol(symbol)
                            .quantity(totalQuantity)
                            .avgBuyPrice(avgBuyPrice)
                            .currentPrice(current.getPrice())
                            .totalValue(currentValue)
                            .profitLoss(profitLoss)
                            .profitLossPercent(profitLossPercent)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void addHolding(String symbol, BigDecimal quantity, BigDecimal buyPrice) {
        portfolioRepository.save(PortfolioHolding.builder()
                .userId(getCurrentUserId())
                .symbol(symbol.toUpperCase())
                .quantity(quantity)
                .buyPrice(buyPrice)
                .createdAt(OffsetDateTime.now())
                .build());
    }

    @Transactional
    public void deleteHolding(Long id) {
        portfolioRepository.deleteById(id);
    }
}
