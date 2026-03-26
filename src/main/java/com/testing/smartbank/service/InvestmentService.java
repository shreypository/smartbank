package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    // 🔥 INVEST
    public String invest(String userCode, String name, double amount, Long accountId) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        if (account.getBalance() < amount) return "Insufficient balance";

        // 💰 Deduct money
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        double returns = amount * 1.12; // +12%

        Investment inv = new Investment();
        inv.setUser(user);
        inv.setAccount(account); // 🔥 IMPORTANT
        inv.setInvestmentName(name);
        inv.setAmountInvested(amount);
        inv.setReturnAmount(returns);
        inv.setWithdrawn(false);

        investmentRepository.save(inv);

        return "Investment successful";
    }

    // 🔥 GET INVESTMENTS
    public List<Investment> getInvestments(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        return investmentRepository.findByUserId(user.getId());
    }

    // 🔥 WITHDRAW (FINAL FIX)
    public String withdraw(Long investmentId, Long accountId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (inv == null || account == null || inv.isWithdrawn()) {
            return "Invalid request";
        }

        // 💰 Add money + 12%
        account.setBalance(account.getBalance() + inv.getReturnAmount());
        accountRepository.save(account);

        inv.setWithdrawn(true);
        investmentRepository.save(inv);

        return "Withdraw successful (+12% profit)";
    }
}