package com.stock.management.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.management.model.StockCurrent;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class MarketDataService {

    private final HttpClient httpClient = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.ALWAYS).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public java.util.List<StockCurrent> fetchQuotes(String symbols) throws Exception {
        // Unofficial Yahoo Finance Quote API endpoint
        String url = String.format("https://query1.finance.yahoo.com/v7/finance/quote?symbols=%s", symbols);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to fetch data from Yahoo Finance: " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode results = root.path("quoteResponse").path("result");

        java.util.List<StockCurrent> stocks = new java.util.ArrayList<>();
        if (results.isArray()) {
            for (JsonNode result : results) {
                stocks.add(StockCurrent.builder()
                        .symbol(result.path("symbol").asText())
                        .price(new BigDecimal(result.path("regularMarketPrice").asText("0")))
                        .change(new BigDecimal(result.path("regularMarketChange").asText("0")))
                        .changePercent(new BigDecimal(result.path("regularMarketChangePercent").asText("0")))
                        .currency(result.path("currency").asText("USD"))
                        .marketTime(OffsetDateTime.ofInstant(Instant.ofEpochSecond(result.path("regularMarketTime").asLong()), ZoneOffset.UTC))
                        .updatedAt(OffsetDateTime.now())
                        .build());
            }
        }
        return stocks;
    }
}
