package com.stock.management.repository;

import com.stock.management.model.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    List<StockHistory> findBySymbolOrderByCapturedAtAsc(String symbol);
    
    @Query("SELECT s FROM StockHistory s WHERE s.symbol = :symbol AND s.capturedAt >= :since ORDER BY s.capturedAt ASC")
    List<StockHistory> findBySymbolAndCapturedAtAfter(@Param("symbol") String symbol, @Param("since") OffsetDateTime since);
}
