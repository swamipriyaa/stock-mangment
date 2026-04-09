package com.stock.management.repository;

import com.stock.management.model.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<PortfolioHolding, Long> {
    List<PortfolioHolding> findByUserId(String userId);
}
