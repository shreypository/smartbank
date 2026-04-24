package com.testing.smartbank.controller;

import com.testing.smartbank.model.Investment;
import com.testing.smartbank.service.InvestmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/investments")
@CrossOrigin // helpful for UI testing
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    // 🔥 INVEST (UPDATED)
    @PostMapping("/invest")
    public String invest(@RequestParam String userCode,
                         @RequestParam String name,
                         @RequestParam double amount,
                         @RequestParam Long accountId,
                         @RequestParam String riskType) {

        return investmentService.invest(userCode, name, amount, accountId, riskType);
    }

    // 🔥 GET ALL INVESTMENTS
    @GetMapping("/user")
    public List<Investment> getInvestments(@RequestParam String userCode) {
        return investmentService.getInvestments(userCode);
    }

    // 🔥 FILTER BY STATUS
    @GetMapping("/filter")
    public List<Investment> getByStatus(@RequestParam String userCode,
                                        @RequestParam String status) {
        return investmentService.getInvestmentsByStatus(userCode, status);
    }

    // 🔥 WITHDRAW
    @PostMapping("/withdraw")
    public String withdraw(@RequestParam Long investmentId,
                           @RequestParam Long accountId) {

        return investmentService.withdraw(investmentId, accountId);
    }

    // 🔥 BULK WITHDRAW (TESTING GOLD)
    @PostMapping("/withdraw-all")
    public String withdrawAll(@RequestParam String userCode,
                              @RequestParam Long accountId) {

        return investmentService.withdrawAll(userCode, accountId);
    }

    // 🔥 PREVIEW RETURNS (VERY IMPORTANT FOR TESTING)
    @GetMapping("/preview")
    public double preview(@RequestParam double amount,
                          @RequestParam double percent) {

        return amount + (amount * percent / 100);
    }

    // 🔥 SIMULATION ENDPOINT (AUTOMATION USE)
    @PostMapping("/simulate")
    public String simulate(@RequestParam String userCode,
                           @RequestParam Long accountId) {

        return investmentService.runSimulation(userCode, accountId);
    }
}