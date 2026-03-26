package com.testing.smartbank.controller;

import com.testing.smartbank.service.LoanService;
import com.testing.smartbank.model.Loan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loans")
public class LoanController {

    @Autowired
    private LoanService loanService;

    // 🔥 APPLY LOAN
    @PostMapping("/apply")
    public String applyLoan(@RequestParam String userCode,
                            @RequestParam double amount,
                            @RequestParam double downPayment,
                            @RequestParam int months,
                            @RequestParam Long accountId) {

        return loanService.applyLoan(userCode, amount, downPayment, months, accountId);
    }

    // 🔥 GET USER LOANS
    @GetMapping("/user")
    public List<Loan> getLoans(@RequestParam String userCode) {
        return loanService.getLoans(userCode);
    }

    // 🔥 PAY LOAN
    @PostMapping("/pay")
    public String payLoan(@RequestParam Long loanId,
                          @RequestParam double amount,
                          @RequestParam Long accountId) {

        return loanService.payLoan(loanId, amount, accountId);
    }
}