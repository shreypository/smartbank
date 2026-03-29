package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private String status;

    // 🔥 APPLY LOAN
    public String applyLoan(String userCode,
                            double amount,
                            double downPayment,
                            int months,
                            Long accountId,
                            String category) {

        User user = userRepository.findByUserCode(userCode);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (user == null || account == null) return "Invalid request";

        // 💰 Apply simple interest (15%)
        double interest = amount * 0.15;
        double total = amount + interest;

        // 💰 Deduct downpayment from loan if needed
        total = total - downPayment;

        // 💰 Credit remaining loan to account
        account.setBalance(account.getBalance() + total);
        accountRepository.save(account);

        // 📝 Log Transaction
        Transaction t = new Transaction();
        t.setTransactionId(UUID.randomUUID().toString());
        t.setType("LOAN_DISBURSEMENT");
        t.setCategory(category != null && !category.isEmpty() ? category : "Loan");
        t.setAmount(total);
        t.setTimestamp(LocalDateTime.now());
        t.setAccount(account);
        transactionRepository.save(t);

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setAccount(account); // 🔥 VERY IMPORTANT
        loan.setTotalAmount(total);
        loan.setRemainingAmount(total);
        loan.setStatus("NOT PAID");
        loan.setCategory(category != null && !category.isEmpty() ? category : "Personal");

        loanRepository.save(loan);

        return "Loan approved";
    }

    // 🔥 GET LOANS
    public List<Loan> getLoans(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        return loanRepository.findByUserId(user.getId());
    }

    public String payLoan(Long loanId, double amount, Long accountId) {

        Loan loan = loanRepository.findById(loanId).orElse(null);
        Account account = accountRepository.findById(accountId).orElse(null);

        if (loan == null || account == null) return "Invalid";
        if ("LOAN CLOSED".equals(loan.getStatus()) || loan.getRemainingAmount() <= 0) {
            return "Loan is already completely paid off.";
        }

        if (account.getBalance() < amount) return "Insufficient balance";

        // Calculate actual amount needed to pay off the loan
        double amountToPay = Math.min(amount, loan.getRemainingAmount());

        // We only deduct the actual amount needed from the user's account
        // Any excess "amount" they tried to pay is just not deducted.
        account.setBalance(account.getBalance() - amountToPay);
        accountRepository.save(account);

        // Reduce loan remaining
        loan.setRemainingAmount(loan.getRemainingAmount() - amountToPay);

        // 📝 Log Transaction
        Transaction t = new Transaction();
        t.setTransactionId(UUID.randomUUID().toString());
        t.setType("LOAN_PAYMENT");
        t.setCategory(loan.getCategory() != null ? loan.getCategory() : "Loan Payment");
        t.setAmount(amountToPay);
        t.setTimestamp(LocalDateTime.now());
        t.setAccount(account);
        transactionRepository.save(t);

        if (loan.getRemainingAmount() <= 0) {
            loan.setRemainingAmount(0); // Ensure exactly 0
            loan.setStatus("LOAN CLOSED");
        }

        loanRepository.save(loan);

        if (amountToPay < amount) {
            double excess = amount - amountToPay;
            return "Loan fully paid! Excess ₹" + String.format("%.2f", excess) + " was kept in your account.";
        }

        return "Payment successful";
    }
}