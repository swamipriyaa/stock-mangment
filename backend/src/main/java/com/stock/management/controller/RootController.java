package com.stock.management.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public String home() {
        return "Stock Management API is running! 🚀\n\nMain endpoints:\n- /api/stock?symbol=AAPL\n- /api/watchlist\n- /api/portfolio";
    }
}
