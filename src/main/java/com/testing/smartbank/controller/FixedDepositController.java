package com.testing.smartbank.controller;

import com.testing.smartbank.model.FixedDeposit;
import com.testing.smartbank.service.FixedDepositService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fd")
public class FixedDepositController {

    @Autowired
    private FixedDepositService fdService;

    // ✅ CREATE FD
    @PostMapping("/create")
    public FixedDeposit createFD(@RequestBody Map<String, Object> body) {

        String accountCode = body.get("accountCode").toString();
        Long accountId = Long.valueOf(body.get("accountId").toString());
        Double amount = Double.valueOf(body.get("amount").toString());
        Integer months = Integer.valueOf(body.get("months").toString());

        return fdService.createFD(accountCode, accountId, amount, months);
    }

    // ✅ GET FDs BY ACCOUNT CODE
    @GetMapping("/account/{code}")
    public List<FixedDeposit> getFDs(@PathVariable String code) {
        return fdService.getByAccountCode(code);
    }

    // ✅ WITHDRAW FD
    @PostMapping("/withdraw/{fdId}")
    public Double withdrawFD(@PathVariable Long fdId) {
        return fdService.withdrawFD(fdId);
    }

    // ✅ ADMIN FORCE MATURE
    @PostMapping("/admin/mature/{fdId}")
    public FixedDeposit forceMature(@PathVariable Long fdId) {
        return fdService.forceMature(fdId);
    }
    @GetMapping("/all")
    public List<FixedDeposit> getAllFDs() {
        return fdService.getAllFDs();
    }
}