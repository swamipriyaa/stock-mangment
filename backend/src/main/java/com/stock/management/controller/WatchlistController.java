package com.stock.management.controller;

import com.stock.management.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<String>> getWatchlist() {
        return ResponseEntity.ok(watchlistService.getWatchlistSymbols());
    }

    @PostMapping
    public ResponseEntity<Void> addToWatchlist(@RequestParam String symbol) {
        watchlistService.addToWatchlist(symbol);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable String symbol) {
        watchlistService.removeFromWatchlist(symbol);
        return ResponseEntity.ok().build();
    }
}
