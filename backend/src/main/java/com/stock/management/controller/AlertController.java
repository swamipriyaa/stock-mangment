package com.stock.management.controller;

import com.stock.management.model.Alert;
import com.stock.management.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAlerts() {
        return ResponseEntity.ok(alertService.getUserAlerts());
    }

    @PostMapping
    public ResponseEntity<Void> createAlert(@RequestParam String symbol, 
                                           @RequestParam BigDecimal targetPrice, 
                                           @RequestParam String condition) {
        alertService.createAlert(symbol, targetPrice, condition);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.ok().build();
    }
}
