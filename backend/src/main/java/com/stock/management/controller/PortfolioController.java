package com.stock.management.controller;

import com.stock.management.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<List<PortfolioService.PortfolioSummary>> getPortfolio() {
        return ResponseEntity.ok(portfolioService.getPortfolio());
    }

    @PostMapping
    public ResponseEntity<Void> addHolding(@RequestParam String symbol, 
                                          @RequestParam BigDecimal quantity, 
                                          @RequestParam BigDecimal buyPrice) {
        portfolioService.addHolding(symbol, quantity, buyPrice);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHolding(@PathVariable Long id) {
        portfolioService.deleteHolding(id);
        return ResponseEntity.ok().build();
    }
}
