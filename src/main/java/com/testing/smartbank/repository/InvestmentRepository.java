package com.testing.smartbank.repository;

import com.testing.smartbank.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByUserId(Long userId);
    List<Investment> findByAccount_Id(Long accountId);
}