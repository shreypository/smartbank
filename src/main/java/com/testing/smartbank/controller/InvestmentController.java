package com.testing.smartbank.controller;

import com.testing.smartbank.service.InvestmentService;
import com.testing.smartbank.model.Investment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/investments")
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    // 🔥 UPDATED INVEST
    @PostMapping("/invest")
    public String invest(@RequestParam String userCode,
                         @RequestParam String name,
                         @RequestParam double amount,
                         @RequestParam Long accountId,
                         @RequestParam double returnPercent) {

        return investmentService.invest(userCode, name, amount, accountId, returnPercent);
    }

    @GetMapping("/user")
    public List<Investment> getInvestments(@RequestParam String userCode) {
        return investmentService.getInvestments(userCode);
    }

    @PostMapping("/withdraw")
    public String withdraw(@RequestParam Long investmentId,
                           @RequestParam Long accountId) {

        return investmentService.withdraw(investmentId, accountId);
    }
}