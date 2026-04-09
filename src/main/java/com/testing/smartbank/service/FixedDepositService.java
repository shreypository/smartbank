package com.testing.smartbank.service;

import com.testing.smartbank.model.Account;
import com.testing.smartbank.model.FixedDeposit;
import com.testing.smartbank.repository.AccountRepository;
import com.testing.smartbank.repository.FixedDepositRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Service
public class FixedDepositService {

    @Autowired
    private FixedDepositRepository fdRepo;

    @Autowired
    private AccountRepository accountRepo;

    public FixedDeposit createFD(String accountCode, Long accountId, Double amount, Integer months,
                                 String interestPayoutType, String nomineeName, String nomineeRelationship,
                                 Boolean autoRenewal, String fdLabel) {

        Account acc = accountRepo.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (acc.getBalance() < amount) {
            throw new RuntimeException("Insufficient balance");
        }

        acc.setBalance(acc.getBalance() - amount);
        accountRepo.save(acc);

        double rate = 6.5;
        double years = months / 12.0;
        double maturityAmount = amount + (amount * rate * years) / 100;

        LocalDate start = LocalDate.now();

        FixedDeposit fd = new FixedDeposit();
        fd.setAccountCode(accountCode);
        fd.setAccountId(accountId);
        fd.setAmount(amount);
        fd.setInterestRate(rate);
        fd.setDurationMonths(months);
        fd.setStartDate(start);
        fd.setMaturityDate(start.plusMonths(months));
        fd.setMaturityAmount(maturityAmount);
        fd.setStatus("ACTIVE");
        
        fd.setInterestPayoutType(interestPayoutType);
        fd.setNomineeName(nomineeName);
        fd.setNomineeRelationship(nomineeRelationship);
        fd.setAutoRenewal(autoRenewal);
        fd.setFdLabel(fdLabel);

        return fdRepo.save(fd);
    }

    public Double withdrawFD(Long fdId) {

        FixedDeposit fd = fdRepo.findById(fdId).orElseThrow();

        if (!fd.getStatus().equals("MATURED")) {
            throw new RuntimeException("FD not matured yet");
        }

        Account acc = accountRepo.findById(fd.getAccountId()).orElseThrow();

        acc.setBalance(acc.getBalance() + fd.getMaturityAmount());
        accountRepo.save(acc);

        fd.setStatus("CLOSED");
        fdRepo.save(fd);

        return fd.getMaturityAmount();
    }
    public List<FixedDeposit> getByAccountCode(String code) {
        return fdRepo.findByAccountCode(code);
    }

    public FixedDeposit forceMature(Long fdId) {

        FixedDeposit fd = fdRepo.findById(fdId)
                .orElseThrow(() -> new RuntimeException("FD not found"));

        fd.setStatus("MATURED");

        return fdRepo.save(fd);
    }
    public List<FixedDeposit> getAllFDs() {
        return fdRepo.findAll();
    }
}