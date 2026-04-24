package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
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

    private final Random random = new Random();

    // 🔥 INVEST
    public String invest(String userCode, String name, double amount, Long accountId, String riskType) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        // ✅ Validation
        if (amount < 100) return "Minimum investment is 100";
        if (amount > 10000) return "Maximum investment is 10000";
        if (account.getBalance() < amount) return "Insufficient balance";

        // ⚠️ Simulate random failure (for testing)
        if (random.nextInt(100) < 5) {
            return "System error. Try again.";
        }

        // 💰 Deduct balance
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        // 🎲 Generate return % based on risk
        double percent = generateReturnPercentage(riskType);

        // 📝 Transaction log
        Transaction t = new Transaction();
        t.setTransactionId(UUID.randomUUID().toString());
        t.setType("INVESTMENT");
        t.setCategory(name != null && !name.isEmpty() ? name : "Investment");
        t.setAmount(amount);
        t.setTimestamp(LocalDateTime.now());
        t.setAccount(account);
        transactionRepository.save(t);

        // 🔥 Create investment
        Investment inv = new Investment();
        inv.setUser(user);
        inv.setAccount(account);
        inv.setInvestmentName(name);
        inv.setAmountInvested(amount);
        inv.setBaseReturnPercentage(percent);
        inv.setInvestedAt(LocalDateTime.now());
        inv.setStatus("ACTIVE");
        inv.setRiskType(riskType);

        // 🔒 Lock-in (seconds)
        inv.setLockInSeconds(30);

        // ⚖️ Rules
        inv.setEarlyWithdrawalPenalty(5);
        inv.setMaturityBonus(10);

        inv.setFlagged(false);

        investmentRepository.save(inv);

        return "Investment successful (" + percent + "%)";
    }

    // 🔥 GET INVESTMENTS
    public List<Investment> getInvestments(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        return investmentRepository.findByUserId(user.getId());
    }

    // 🔥 WITHDRAW
    public String withdraw(Long investmentId, Long accountId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (inv == null || account == null) return "Invalid request";

        // 🔐 Account validation
        if (!inv.getAccount().getId().equals(accountId)) {
            return "Account mismatch";
        }

        // ❌ Already withdrawn
        if ("WITHDRAWN".equals(inv.getStatus())) {
            return "Already withdrawn";
        }

        // ⏱️ Time held
        long secondsHeld = Duration.between(inv.getInvestedAt(), LocalDateTime.now()).getSeconds();

        double finalPercent = inv.getBaseReturnPercentage();

        // 🔒 Lock-in check
        if (secondsHeld < inv.getLockInSeconds()) {
            finalPercent -= inv.getEarlyWithdrawalPenalty();
        }

        // 🎁 Bonus
        if (secondsHeld > 60) {
            finalPercent += inv.getMaturityBonus();
        }

        // 🎲 Random fluctuation (for HIGH risk)
        if ("HIGH".equalsIgnoreCase(inv.getRiskType())) {
            finalPercent += random.nextInt(11) - 5; // -5 to +5
        }

        // 💸 Allow LOSS
        double returns = inv.getAmountInvested() +
                (inv.getAmountInvested() * finalPercent / 100);

        // 💰 Update balance
        account.setBalance(account.getBalance() + returns);
        accountRepository.save(account);

        // 📝 Transaction
        Transaction t = new Transaction();
        t.setTransactionId(UUID.randomUUID().toString());
        t.setType("INVESTMENT_RETURN");
        t.setCategory(inv.getInvestmentName());
        t.setAmount(returns);
        t.setTimestamp(LocalDateTime.now());
        t.setAccount(account);
        transactionRepository.save(t);

        // ✅ Update investment
        inv.setFinalReturnPercentage(finalPercent);
        inv.setWithdrawnAt(LocalDateTime.now());
        inv.setStatus("WITHDRAWN");

        investmentRepository.save(inv);

        return "Withdraw successful (" + finalPercent + "%)";
    }

    // 🎲 RETURN GENERATOR
    private double generateReturnPercentage(String riskType) {

        if ("LOW".equalsIgnoreCase(riskType)) {
            return 1 + random.nextDouble() * 4; // 1% to 5%
        }

        if ("MEDIUM".equalsIgnoreCase(riskType)) {
            return -5 + random.nextDouble() * 15; // -5% to +10%
        }

        if ("HIGH".equalsIgnoreCase(riskType)) {
            return -20 + random.nextDouble() * 50; // -20% to +30%
        }

        return 5; // default
    }

    public List<Investment> getInvestmentsByStatus(String userCode, String status) {

        User user = userRepository.findByUserCode(userCode);

        if (user == null) return List.of();

        return investmentRepository.findByUserIdAndStatus(user.getId(), status.toUpperCase());
    }

    public String withdrawAll(String userCode, Long accountId) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        List<Investment> investments = investmentRepository.findByUserId(user.getId());

        int success = 0;
        int failed = 0;

        for (Investment inv : investments) {

            if (!"ACTIVE".equals(inv.getStatus())) {
                failed++;
                continue;
            }

            String result = withdraw(inv.getId(), accountId);

            if (result.contains("successful")) {
                success++;
            } else {
                failed++;
            }
        }

        return "Bulk withdraw complete: " + success + " success, " + failed + " failed";
    }

    public String runSimulation(String userCode, Long accountId) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        String[] risks = {"LOW", "MEDIUM", "HIGH"};

        // 🔥 Auto create 5 investments
        for (int i = 0; i < 5; i++) {

            double amount = 100 + (Math.random() * 900); // 100–1000
            String risk = risks[(int) (Math.random() * risks.length)];

            invest(userCode, "Sim-" + i, amount, accountId, risk);
        }

        // ⏱️ Simulate delay effect manually (optional in UI)
        List<Investment> investments = investmentRepository.findByUserId(user.getId());

        int withdrawn = 0;

        for (Investment inv : investments) {

            if ("ACTIVE".equals(inv.getStatus())) {
                withdraw(inv.getId(), accountId);
                withdrawn++;
            }
        }

        return "Simulation complete. Withdrawn: " + withdrawn;
    }
}