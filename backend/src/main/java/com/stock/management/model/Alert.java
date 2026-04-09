package com.stock.management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String symbol;

    @Column(name = "target_price", nullable = false)
    private BigDecimal targetPrice;

    @Column(nullable = false)
    private String condition; // "ABOVE" or "BELOW"

    @Column(name = "is_triggered")
    private Boolean isTriggered;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
