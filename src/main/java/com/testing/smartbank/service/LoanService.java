package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private String status;

    // 🔥 APPLY LOAN
    public String applyLoan(String userCode,
                            double amount,
                            double downPayment,
                            int months,
                            Long accountId) {

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

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setAccount(account); // 🔥 VERY IMPORTANT
        loan.setTotalAmount(total);
        loan.setRemainingAmount(total);
        loan.setStatus("NOT PAID");

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

        if (account.getBalance() < amount) return "Insufficient balance";

        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        loan.setRemainingAmount(loan.getRemainingAmount() - amount);

        if (loan.getRemainingAmount() <= 0) {
            loan.setStatus("LOAN CLOSED");
        }

        loanRepository.save(loan);

        return "Payment successful";
    }
}