package com.stock.management.repository;

import com.stock.management.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserId(String userId);
    Optional<Watchlist> findByUserIdAndSymbol(String userId, String symbol);
    void deleteByUserIdAndSymbol(String userId, String symbol);
}
