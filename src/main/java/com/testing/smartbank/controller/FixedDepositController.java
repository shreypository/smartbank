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
        
        String interestPayoutType = body.containsKey("interestPayoutType") ? body.get("interestPayoutType").toString() : null;
        String nomineeName = body.containsKey("nomineeName") ? body.get("nomineeName").toString() : null;
        String nomineeRelationship = body.containsKey("nomineeRelationship") ? body.get("nomineeRelationship").toString() : null;
        Boolean autoRenewal = body.containsKey("autoRenewal") ? Boolean.valueOf(body.get("autoRenewal").toString()) : false;
        String fdLabel = body.containsKey("fdLabel") && body.get("fdLabel") != null ? body.get("fdLabel").toString() : null;

        return fdService.createFD(accountCode, accountId, amount, months, interestPayoutType, nomineeName, nomineeRelationship, autoRenewal, fdLabel);
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