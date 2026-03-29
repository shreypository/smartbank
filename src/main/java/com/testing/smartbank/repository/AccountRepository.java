package com.testing.smartbank.repository;
import com.testing.smartbank.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserIdAndAccountType(Long userId, String accountType);
    List<Account> findByUserId(Long userId);
    Account findFirstByUserId(Long userId);
}