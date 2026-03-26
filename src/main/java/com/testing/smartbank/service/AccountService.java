package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class AccountService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // 🔥 CREATE ACCOUNT
    public Account createAccount(String userCode, String accountType) {

        User user = userRepository.findByUserCode(userCode);

        if (user == null) {
            return null;
        }

        // 🔥 Get all accounts of user
        List<Account> allAccounts = accountRepository.findByUserId(user.getId());

        // 🔥 Limit: Max 3 accounts
        if (allAccounts.size() >= 3) {
            return null;
        }

        // 🔥 Prevent duplicate account type
        List<Account> existingAccounts =
                accountRepository.findByUserIdAndAccountType(user.getId(), accountType);

        if (!existingAccounts.isEmpty()) {
            return null;
        }

        // 🔥 Create new account
        Account account = new Account();
        account.setUser(user);
        account.setAccountType(accountType);
        account.setBalance(50000);

        // 🔥 Generate 7-digit account number
        account.setAccountNumber(String.format("%07d", new Random().nextInt(10000000)));

        return accountRepository.save(account);
    }

    // 🔐 DEPOSIT (SECURE)
    public Account deposit(Long accountId, double amount, String userCode) {

        Account account = accountRepository.findById(accountId).orElse(null);

        if (account == null || amount <= 0) {
            return null;
        }

        if (!account.getUser().getUserCode().equals(userCode)) {
            return null;
        }

        account.setBalance(account.getBalance() + amount);
        Account savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setType("DEPOSIT");
        transaction.setCategory("general");
        transaction.setAmount(amount);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setAccount(savedAccount);

        transactionRepository.save(transaction);

        return savedAccount;
    }

    // 🔐 WITHDRAW (SECURE)
    public Account withdraw(Long accountId, double amount, String userCode) {

        Account account = accountRepository.findById(accountId).orElse(null);

        if (account == null || amount <= 0 || account.getBalance() < amount) {
            return null;
        }

        if (!account.getUser().getUserCode().equals(userCode)) {
            return null;
        }

        account.setBalance(account.getBalance() - amount);
        Account savedAccount = accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setType("WITHDRAW");
        transaction.setCategory("general");
        transaction.setAmount(amount);
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setAccount(savedAccount);

        transactionRepository.save(transaction);

        return savedAccount;
    }

    // 🔐 TRANSFER (SECURE)
    public String transfer(Long fromAccountId,
                           Long toAccountId,
                           double amount,
                           String userCode,
                           String category) {

        Account from = accountRepository.findById(fromAccountId).orElse(null);
        Account to = accountRepository.findById(toAccountId).orElse(null);

        if (from == null || to == null) return "Invalid accounts";

        if (!from.getUser().getUserCode().equals(userCode)) {
            return "Unauthorized";
        }

        if (from.getBalance() < amount) {
            return "Insufficient balance";
        }

        // 💰 Update balances
        from.setBalance(from.getBalance() - amount);
        to.setBalance(to.getBalance() + amount);

        accountRepository.save(from);
        accountRepository.save(to);

        // 🔴 SENDER TRANSACTION
        Transaction t1 = new Transaction();
        t1.setAccount(from);
        t1.setAmount(amount);
        t1.setType("TRANSFER_OUT");
        t1.setCategory(category);
        t1.setTimestamp(LocalDateTime.now());
        t1.setTransactionId(UUID.randomUUID().toString());

        transactionRepository.save(t1);

        // 🟢 RECEIVER TRANSACTION
        Transaction t2 = new Transaction();
        t2.setAccount(to);
        t2.setAmount(amount);
        t2.setType("TRANSFER_IN");
        t2.setCategory(category);
        t2.setTimestamp(LocalDateTime.now());
        t2.setTransactionId(UUID.randomUUID().toString());

        transactionRepository.save(t2);

        return "Transfer successful";
    }

    public List<Transaction> getTransactions(Long accountId) {
        return transactionRepository.findByAccountId(accountId);
    }

    public List<Transaction> getTransactionsByType(Long accountId, String type) {
        return transactionRepository.findByAccountIdAndType(accountId, type);
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis();
    }

    public List<Account> getAccountsByUserCode(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        if (user == null) return List.of();
        return accountRepository.findByUserId(user.getId());
    }

    public List<Transaction> findByTransactionId(String txnId) {
        return transactionRepository.findByTransactionId(txnId);
    }

    public List<Transaction> findByAmount(double amount) {
        return transactionRepository.findByAmount(amount);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public String adminUpdateBalance(Long accountId, double amount) {

        Account account = accountRepository.findById(accountId).orElse(null);

        if (account == null) return "Account not found";

        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);

        return "Balance updated by admin";
    }

    public String deleteAccount(Long accountId) {

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) return "Account not found";

        // 🔥 DELETE TRANSACTIONS
        List<Transaction> transactions = transactionRepository.findByAccountId(accountId);
        transactionRepository.deleteAll(transactions);

        // 🔥 DELETE INVESTMENTS
        List<Investment> investments = investmentRepository.findByAccount_Id(accountId);
        investmentRepository.deleteAll(investments);

        // 🔥 DELETE LOANS
        List<Loan> loans = loanRepository.findByAccount_Id(accountId);
        loanRepository.deleteAll(loans);

        // 🔥 DELETE ACCOUNT
        accountRepository.delete(account);

        return "Account deleted successfully";
    }

    public String atmDeposit(Long accountId, double amount, String userCode) {

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) return "Account not found";

        if (!account.getUser().getUserCode().equals(userCode)) {
            return "Unauthorized";
        }

        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);

        Transaction t = new Transaction();
        t.setAccount(account);
        t.setAmount(amount);
        t.setType("ATM_DEPOSIT");
        t.setCategory("PERSONAL");
        t.setTimestamp(LocalDateTime.now());
        t.setTransactionId(UUID.randomUUID().toString());

        transactionRepository.save(t);

        return "ATM Deposit Successful";
    }

    public String atmWithdraw(Long accountId, double amount, String userCode) {

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) return "Account not found";

        if (!account.getUser().getUserCode().equals(userCode)) {
            return "Unauthorized";
        }

        if (account.getBalance() < amount) {
            return "Insufficient balance";
        }

        account.setBalance(account.getBalance() - amount);
        accountRepository.save(account);

        Transaction t = new Transaction();
        t.setAccount(account);
        t.setAmount(amount);
        t.setType("ATM_WITHDRAW");
        t.setCategory("PERSONAL");
        t.setTimestamp(LocalDateTime.now());
        t.setTransactionId(UUID.randomUUID().toString());

        transactionRepository.save(t);

        return "ATM Withdrawal Successful";
    }
    public List<Account> getUserAccounts(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        return accountRepository.findAll()
                .stream()
                .filter(acc -> acc.getUser().getId().equals(user.getId()))
                .toList();
    }

}