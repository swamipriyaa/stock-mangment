package com.stock.management.repository;

import com.stock.management.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserId(String userId);
    List<Alert> findBySymbolAndIsTriggeredFalse(String symbol);
}
