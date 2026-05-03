package com.testing.smartbank.service;
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional
    public String invest(String userCode, String name, double amount,
                         Long accountId, String riskType, double expectedReturn) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        if (amount < 100) return "Minimum investment is 100";
        if (amount > 1000000) return "Maximum investment is 1000000";
        if (account.getBalance() < amount) return "Insufficient balance";

        // 🔥 Failure simulation
        if (random.nextInt(100) < 5) {
            return "System error. Try again.";
        }

        // 💰 Deduct balance
        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        double percent = expectedReturn;

        // 📝 Transaction
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
        inv.setRiskType(riskType);

        // 🔒 Lock logic
        inv.setLockInSeconds(30);
        inv.setStatus("LOCKED");

        inv.setEarlyWithdrawalPenalty(5);
        inv.setMaturityBonus(10);

        inv.setFlagged(false);

        investmentRepository.save(inv);

        return String.format("Investment successful. Locked Return: %.2f%%", percent);
    }

    private void updateInvestmentStatus(Investment inv) {

        long secondsHeld = Duration.between(inv.getInvestedAt(), LocalDateTime.now()).getSeconds();

        if ("WITHDRAWN".equals(inv.getStatus())) return;

        if (secondsHeld < inv.getLockInSeconds()) {
            inv.setStatus("LOCKED");
        } else if (secondsHeld >= 60) {
            inv.setStatus("MATURED");
        } else {
            inv.setStatus("ACTIVE");
        }
    }

    // 🔥 GET INVESTMENTS
    public List<Investment> getInvestments(String userCode) {

        User user = userRepository.findByUserCode(userCode);
        if (user == null) return List.of();

        List<Investment> list = investmentRepository.findByUserId(user.getId());

        for (Investment inv : list) {
            updateInvestmentStatus(inv);
        }

        return list;
    }

    // 🔥 WITHDRAW
    public String withdraw(Long investmentId, Long accountId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (inv == null || account == null) return "Invalid request";

        if (!inv.getAccount().getId().equals(accountId)) {
            return "Account mismatch";
        }

        if ("WITHDRAWN".equals(inv.getStatus())) {
            return "Already withdrawn";
        }

        // 🔥 UPDATE STATUS FIRST
        updateInvestmentStatus(inv);

        long secondsHeld = Duration.between(inv.getInvestedAt(), LocalDateTime.now()).getSeconds();

        double finalPercent = inv.getBaseReturnPercentage();

        // 🔒 Early withdrawal penalty
        if (secondsHeld < inv.getLockInSeconds()) {
            finalPercent -= inv.getEarlyWithdrawalPenalty();
        }

        // 🎁 Bonus
        if ("MATURED".equals(inv.getStatus())) {
            finalPercent += inv.getMaturityBonus();
        }

        // 🎲 HIGH risk fluctuation
        if ("HIGH".equalsIgnoreCase(inv.getRiskType())) {
            finalPercent += random.nextInt(11) - 5;
        }

        double returns = inv.getAmountInvested() +
                (inv.getAmountInvested() * finalPercent / 100);

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

        inv.setFinalReturnPercentage(finalPercent);
        inv.setWithdrawnAt(LocalDateTime.now());
        inv.setStatus("WITHDRAWN");

        investmentRepository.save(inv);

        return String.format("Withdraw successful. Return: %.2f%% | Credited: ₹%.2f",
                finalPercent, returns);
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

            updateInvestmentStatus(inv);

            if (!"ACTIVE".equals(inv.getStatus()) && !"MATURED".equals(inv.getStatus())) {
                failed++;
                continue;
            }

            String result = withdraw(inv.getId(), accountId);

            if (result.contains("successful")) success++;
            else failed++;
        }

        return String.format("Bulk Withdraw → ✅ %d success | ❌ %d failed", success, failed);
    }

    public String runSimulation(String userCode, Long accountId) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        String[] risks = {"LOW", "MEDIUM", "HIGH"};

        for (int i = 0; i < 5; i++) {

            double amount = 100 + (Math.random() * 900);
            String risk = risks[(int) (Math.random() * risks.length)];

            double expectedReturn = generateReturnPercentage(risk);

            invest(userCode, "Sim-" + i, amount, accountId, risk, expectedReturn);
        }

        List<Investment> investments = investmentRepository.findByUserId(user.getId());

        int withdrawn = 0;

        for (Investment inv : investments) {

            updateInvestmentStatus(inv);

            if ("ACTIVE".equals(inv.getStatus()) || "MATURED".equals(inv.getStatus())) {
                withdraw(inv.getId(), accountId);
                withdrawn++;
            }
        }

        return "Simulation complete. Withdrawn: " + withdrawn;
    }

    public String forceMature(Long investmentId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);

        if (inv == null) return "Investment not found";

        if ("WITHDRAWN".equals(inv.getStatus())) {
            return "Already withdrawn";
        }

        inv.setStatus("MATURED");
        inv.setInvestedAt(LocalDateTime.now().minusSeconds(120));

        investmentRepository.save(inv);

        return "Investment force matured";
    }

    public String validateTransactions(Long investmentId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);

        if (inv == null) return "Investment not found";

        List<Transaction> txns = transactionRepository.findByAccount_Id(inv.getAccount().getId());

        boolean hasInvest = txns.stream().anyMatch(t ->
                t.getType().equals("INVESTMENT") &&
                        t.getAmount() == inv.getAmountInvested()
        );

        boolean hasReturn = txns.stream().anyMatch(t ->
                t.getType().equals("INVESTMENT_RETURN")
        );

        if (!hasInvest) return "Missing INVESTMENT transaction";
        if ("WITHDRAWN".equals(inv.getStatus()) && !hasReturn)
            return "Missing RETURN transaction";

        return "Transactions valid";
    }

    public String validateProfit(Long investmentId) {

        Investment inv = investmentRepository.findById(investmentId).orElse(null);

        if (inv == null) return "Investment not found";

        double expected;

        if ("WITHDRAWN".equals(inv.getStatus())) {
            expected = inv.getAmountInvested() *
                    (inv.getFinalReturnPercentage() / 100);
        } else {
            expected = inv.getAmountInvested() *
                    (inv.getBaseReturnPercentage() / 100);
        }

        return String.format("Expected Profit: ₹%.2f", expected);
    }


}