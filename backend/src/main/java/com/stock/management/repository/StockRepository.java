package com.stock.management.repository;

import com.stock.management.model.StockCurrent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository extends JpaRepository<StockCurrent, String> {
}
