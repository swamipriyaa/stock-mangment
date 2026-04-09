package com.stock.management.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "stocks_current")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCurrent {
    @Id
    private String symbol;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal change;

    @Column(name = "change_percent")
    private BigDecimal changePercent;

    private String currency;

    @Column(name = "market_time")
    private OffsetDateTime marketTime;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
