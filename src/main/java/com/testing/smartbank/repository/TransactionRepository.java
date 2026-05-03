package com.testing.smartbank.repository;

import com.testing.smartbank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountId(Long accountId);
    List<Transaction> findByAccountIdAndType(Long accountId, String type);
    List<Transaction> findByTransactionId(String transactionId);
    List<Transaction> findByAccount_Id(Long accountId);


    List<Transaction> findByAmount(double amount);
}