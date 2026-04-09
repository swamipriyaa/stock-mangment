package com.stock.management.service;

import com.stock.management.model.StockCurrent;
import com.stock.management.model.StockHistory;
import com.stock.management.repository.StockHistoryRepository;
import com.stock.management.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {

    private final StockRepository stockRepository;
    private final StockHistoryRepository historyRepository;
    private final MarketDataService marketDataService;
    private final AlertService alertService;

    private static final int CACHE_TTL_SECONDS = 10;

    @Transactional
    public StockCurrent getOrFetchStock(String symbol) {
        String normalizedSymbol = symbol.trim().toUpperCase();
        
        // 1. Check cache
        Optional<StockCurrent> cachedOpt = stockRepository.findById(normalizedSymbol);
        
        if (cachedOpt.isPresent()) {
            StockCurrent cached = cachedOpt.get();
            if (isCacheFresh(cached)) {
                log.debug("Cache hit for symbol: {}", normalizedSymbol);
                return cached;
            }
        }

        // 2. Return stale cache if present (data will be refreshed next ingest from Next.js)
        if (cachedOpt.isPresent()) {
            log.debug("Returning stale cache for {}; awaiting ingest refresh", normalizedSymbol);
            return cachedOpt.get();
        }

        // 3. Fallback: try fetching directly from Yahoo (may fail for server IPs)
        try {
            log.info("No cache for {}, attempting direct market fetch", normalizedSymbol);
            java.util.List<StockCurrent> freshDataList = marketDataService.fetchQuotes(normalizedSymbol);
            if (!freshDataList.isEmpty()) {
                return saveStockSnapshot(freshDataList.get(0));
            }
        } catch (Exception e) {
            log.warn("Direct fetch failed for {}: {}", normalizedSymbol, e.getMessage());
        }

        throw new RuntimeException("Market data unavailable for: " + normalizedSymbol);
    }

    /**
     * Accepts externally-fetched stock data (from the Next.js proxy via Yahoo Finance).
     * Saves to DB and triggers alert checks. Called from StockController /api/stock/ingest.
     */
    @Transactional
    public StockCurrent ingestExternalData(StockCurrent data) {
        log.debug("Ingesting external data for {}: price={}", data.getSymbol(), data.getPrice());
        return saveStockSnapshot(data);
    }

    @Transactional
    public java.util.List<StockCurrent> getBatchStocks(java.util.List<String> symbols) {
        return symbols.stream()
                .map(this::getOrFetchStock)
                .collect(java.util.stream.Collectors.toList());
    }

    private boolean isCacheFresh(StockCurrent stock) {
        if (stock.getUpdatedAt() == null) return false;
        return stock.getUpdatedAt().isAfter(OffsetDateTime.now().minusSeconds(CACHE_TTL_SECONDS));
    }

    private StockCurrent saveStockSnapshot(StockCurrent data) {
        // Upsert current
        data.setUpdatedAt(OffsetDateTime.now());
        StockCurrent saved = stockRepository.save(data);

        // Insert history
        historyRepository.save(StockHistory.builder()
                .symbol(data.getSymbol())
                .price(data.getPrice())
                .capturedAt(OffsetDateTime.now())
                .build());

        // Check alerts
        alertService.checkAlerts(data.getSymbol(), data.getPrice());

        return saved;
    }
}
