package com.testing.smartbank.controller;

import com.testing.smartbank.model.Account;
import com.testing.smartbank.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.testing.smartbank.model.Transaction;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/create")
    public Object createAccount(@RequestParam String userCode,
                                @RequestParam String accountType) {

        Account account = accountService.createAccount(userCode, accountType);

        if (account != null) {
            return Map.of(
                    "accountId", account.getId(),
                    "accountNumber", account.getAccountNumber(),
                    "accountType", account.getAccountType()
            );
        } else {
            return "Account already exists or user not found";
        }
    }

    @PostMapping("/deposit")
    public Object deposit(@RequestParam Long accountId,
                          @RequestParam double amount,
                          @RequestParam String userCode) {

        Account account = accountService.deposit(accountId, amount, userCode);

        if (account != null) {
            return Map.of(
                    "accountId", account.getId(),
                    "balance", account.getBalance()
            );
        } else {
            return "Unauthorized or invalid request";
        }
    }

    @PostMapping("/transfer")
    public String transfer(@RequestParam Long fromAccountId,
                           @RequestParam Long toAccountId,
                           @RequestParam double amount,
                           @RequestParam String userCode,
                           @RequestParam String category) {

        return accountService.transfer(fromAccountId, toAccountId, amount, userCode, category);
    }

    @PostMapping("/withdraw")
    public Object withdraw(@RequestParam Long accountId,
                           @RequestParam double amount,
                           @RequestParam String userCode) {

        Account account = accountService.withdraw(accountId, amount, userCode);

        if (account != null) {
            return Map.of(
                    "accountId", account.getId(),
                    "balance", account.getBalance()
            );
        } else {
            return "Unauthorized or insufficient balance";
        }
    }

    @GetMapping("/transactions")
    public List<Map<String, Object>> getTransactions(@RequestParam Long accountId) {

        List<Transaction> transactions = accountService.getTransactions(accountId);

        return transactions.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("type", t.getType());
            map.put("amount", t.getAmount());
            map.put("timestamp", t.getTimestamp());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/transactions/filter")
    public List<Map<String, Object>> getTransactionsByType(
            @RequestParam Long accountId,
            @RequestParam String type) {

        List<Transaction> transactions = accountService.getTransactionsByType(accountId, type);

        return transactions.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("transactionId", t.getTransactionId());
            map.put("type", t.getType());
            map.put("category", t.getCategory());
            map.put("amount", t.getAmount());
            map.put("timestamp", t.getTimestamp());

            if (t.getSender() != null)
                map.put("from", t.getSender().getAccountNumber());

            if (t.getReceiver() != null)
                map.put("to", t.getReceiver().getAccountNumber());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/user")
    public List<Map<String, Object>> getUserAccounts(@RequestParam String userCode) {

        List<Account> accounts = accountService.getUserAccounts(userCode);

        return accounts.stream().map(acc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", acc.getId());
            map.put("accountNumber", acc.getAccountNumber());
            map.put("accountType", acc.getAccountType());
            map.put("balance", acc.getBalance());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/transactions/search/id")
    public List<Transaction> searchById(@RequestParam String txnId) {
        return accountService.findByTransactionId(txnId);
    }

    @GetMapping("/transactions/search/amount")
    public List<Transaction> searchByAmount(@RequestParam double amount) {
        return accountService.findByAmount(amount);
    }

    @GetMapping("/all")
    public List<Map<String, Object>> getAllAccounts() {

        List<Account> accounts = accountService.getAllAccounts();

        return accounts.stream().map(acc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", acc.getId());
            map.put("accountNumber", acc.getAccountNumber());
            map.put("accountType", acc.getAccountType());
            map.put("balance", acc.getBalance());
            map.put("userCode", acc.getUser().getUserCode()); // 🔥 important

            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/admin/updateBalance")
    public String updateBalance(@RequestParam Long accountId,
                                @RequestParam double amount) {

        return accountService.adminUpdateBalance(accountId, amount);
    }

    @DeleteMapping("/delete")
    public String deleteAccount(@RequestParam Long accountId) {
        return accountService.deleteAccount(accountId);
    }
    @PostMapping("/atm/deposit")
    public String atmDeposit(@RequestParam Long accountId,
                             @RequestParam double amount,
                             @RequestParam String userCode) {

        return accountService.atmDeposit(accountId, amount, userCode);
    }

    @PostMapping("/atm/withdraw")
    public String atmWithdraw(@RequestParam Long accountId,
                              @RequestParam double amount,
                              @RequestParam String userCode) {

        return accountService.atmWithdraw(accountId, amount, userCode);
    }
}