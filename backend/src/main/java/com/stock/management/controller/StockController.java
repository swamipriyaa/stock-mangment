package com.stock.management.controller;

import com.stock.management.model.StockCurrent;
import com.stock.management.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final com.stock.management.repository.StockHistoryRepository historyRepository;

    @GetMapping
    public ResponseEntity<StockCurrent> getStock(@RequestParam String symbol) {
        try {
            StockCurrent stock = stockService.getOrFetchStock(symbol);
            return ResponseEntity.ok(stock);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/batch")
    public ResponseEntity<java.util.List<StockCurrent>> getStocks(@RequestParam String symbols) {
        try {
            java.util.List<String> symbolList = java.util.Arrays.asList(symbols.split(","));
            java.util.List<StockCurrent> stocks = stockService.getBatchStocks(symbolList);
            return ResponseEntity.ok(stocks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<com.stock.management.model.StockHistory>> getHistory(
            @RequestParam String symbol,
            @RequestParam(required = false) String timeframe) {
        try {
            String sym = symbol.trim().toUpperCase();
            if (timeframe == null || timeframe.equalsIgnoreCase("all")) {
                return ResponseEntity.ok(historyRepository.findBySymbolOrderByCapturedAtAsc(sym));
            }

            OffsetDateTime since;
            switch (timeframe.toLowerCase()) {
                case "1h":
                    since = OffsetDateTime.now().minusHours(1);
                    break;
                case "1d":
                    since = OffsetDateTime.now().minusDays(1);
                    break;
                case "1w":
                    since = OffsetDateTime.now().minusWeeks(1);
                    break;
                case "1m":
                    since = OffsetDateTime.now().minusMonths(1);
                    break;
                default:
                    return ResponseEntity.ok(historyRepository.findBySymbolOrderByCapturedAtAsc(sym));
            }

            java.util.List<com.stock.management.model.StockHistory> history = historyRepository.findBySymbolAndCapturedAtAfter(sym, since);
            
            // Downsample for performance on longer periods
            if (timeframe.equalsIgnoreCase("1w") && history.size() > 200) {
                java.util.List<com.stock.management.model.StockHistory> sampled = new java.util.ArrayList<>();
                for (int i = 0; i < history.size(); i += 5) {
                    sampled.add(history.get(i));
                }
                return ResponseEntity.ok(sampled);
            } else if (timeframe.equalsIgnoreCase("1m") && history.size() > 300) {
                java.util.List<com.stock.management.model.StockHistory> sampled = new java.util.ArrayList<>();
                for (int i = 0; i < history.size(); i += 10) {
                    sampled.add(history.get(i));
                }
                return ResponseEntity.ok(sampled);
            }

            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Internal ingestion endpoint — called by the Next.js proxy after it fetches
     * fresh data from Yahoo Finance. No auth required (internal server-to-server call).
     * Saves the data to the DB and triggers alert checks.
     */
    @PostMapping("/ingest")
    public ResponseEntity<Void> ingestStock(@RequestBody Map<String, Object> payload) {
        try {
            StockCurrent stock = StockCurrent.builder()
                    .symbol(((String) payload.get("symbol")).trim().toUpperCase())
                    .price(new BigDecimal(String.valueOf(payload.get("price"))))
                    .change(payload.get("change") != null ? new BigDecimal(String.valueOf(payload.get("change"))) : BigDecimal.ZERO)
                    .changePercent(payload.get("changePercent") != null ? new BigDecimal(String.valueOf(payload.get("changePercent"))) : BigDecimal.ZERO)
                    .currency(payload.get("currency") != null ? (String) payload.get("currency") : "USD")
                    .marketTime(payload.get("marketTime") != null ? OffsetDateTime.parse((String) payload.get("marketTime")) : OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            stockService.ingestExternalData(stock);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Non-critical - log but don't fail
            return ResponseEntity.ok().build();
        }
    }
}
