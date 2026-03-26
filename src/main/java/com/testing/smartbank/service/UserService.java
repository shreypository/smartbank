package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔥 REGISTER USER
    public User saveUser(User user) {

        long count = userRepository.count() + 1;

        String userCode = "MV" + String.format("%02d", count);

        user.setUserCode(userCode);

        return userRepository.save(user);
    }

    // 🔥 LOGIN
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            return user;
        } else {
            return null;
        }
    }

    // 🔥 GET ALL USERS (ADMIN)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔥 DELETE USER (WITH ALL DATA)
    public String deleteUser(Long userId) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";

        // 🔥 Delete accounts
        List<Account> accounts = accountRepository.findByUserId(userId);
        for (Account acc : accounts) {
            accountRepository.delete(acc);
        }

        // 🔥 Delete cards
        List<Card> cards = cardRepository.findByUserId(userId);
        for (Card c : cards) {
            cardRepository.delete(c);
        }

        // 🔥 Delete loans
        List<Loan> loans = loanRepository.findByUserId(userId);
        for (Loan l : loans) {
            loanRepository.delete(l);
        }

        // 🔥 Delete investments
        List<Investment> investments = investmentRepository.findByUserId(userId);
        for (Investment i : investments) {
            investmentRepository.delete(i);
        }

        // 🔥 Finally delete user
        userRepository.delete(user);

        return "User deleted successfully";
    }
}