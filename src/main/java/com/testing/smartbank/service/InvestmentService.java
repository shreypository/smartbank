package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // 🔥 INVEST
    public String invest(String userCode, String name, double amount, Long accountId, double returnPercent) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        if (account.getBalance() < amount) return "Insufficient balance";

        // 💰 Deduct money
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        // 📝 Log Transaction
        Transaction t = new Transaction();
        t.setTransactionId(UUID.randomUUID().toString());
        t.setType("INVESTMENT");
        t.setCategory(name != null && !name.isEmpty() ? name : "Investment");
        t.setAmount(amount);
        t.setTimestamp(LocalDateTime.now());
        t.setAccount(account);
        transactionRepository.save(t);

        // 🔥 Calculate returns
        double returns = amount + (amount * returnPercent / 100);

        Investment inv = new Investment();
        inv.setUser(user);
        inv.setAccount(account);
        inv.setInvestmentName(name);
        inv.setAmountInvested(amount);
        inv.setReturnAmount(returns);
        inv.setReturnPercentage(returnPercent);
        inv.setWithdrawn(false); // ✅ active

        investmentRepository.save(inv);

        return "Investment successful (" + returnPercent + "%)";
    }

    // 🔥 GET INVESTMENTS
    public List<Investment> getInvestments(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        return investmentRepository.findByUserId(user.getId());
    }

    // 🔥 WITHDRAW (FIXED)
    public String withdraw(Long investmentId, Long accountId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (inv == null || account == null) {
            return "Invalid request";
        }

        // ❌ Prevent multiple withdrawals
        if (inv.isWithdrawn()) {
            return "Already withdrawn";
        }

        // 💰 Add return amount to account
        account.setBalance(account.getBalance() + inv.getReturnAmount());
        accountRepository.save(account);

        // 📝 Log Transaction
        Transaction t = new Transaction();
        t.setTransactionId(UUID.randomUUID().toString());
        t.setType("INVESTMENT_RETURN");
        t.setCategory(inv.getInvestmentName());
        t.setAmount(inv.getReturnAmount());
        t.setTimestamp(LocalDateTime.now());
        t.setAccount(account);
        transactionRepository.save(t);

        // ✅ MARK AS WITHDRAWN (CRITICAL FIX)
        inv.setWithdrawn(true);
        investmentRepository.save(inv);

        return "Withdraw successful (" + inv.getReturnPercentage() + "%)";
    }
}