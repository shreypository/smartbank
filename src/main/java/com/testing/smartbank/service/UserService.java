package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // ── REGISTER USER ─────────────────────────────────────────
    public Map<String, String> registerUser(User user) {
        Map<String, String> result = new HashMap<>();

        // 1. Duplicate email
        if (userRepository.findByEmail(user.getEmail()) != null) {
            result.put("status", "error");
            result.put("field", "email");
            result.put("message", "Email address is already registered. Please use a different email.");
            return result;
        }

        // 2. Duplicate phone
        if (user.getPhone() != null && userRepository.findByPhone(user.getPhone()) != null) {
            result.put("status", "error");
            result.put("field", "phone");
            result.put("message", "Phone number is already in use. Please use a different number.");
            return result;
        }

        // 3. Duplicate PAN
        if (user.getPanNumber() != null && userRepository.findByPanNumber(user.getPanNumber()) != null) {
            result.put("status", "error");
            result.put("field", "panNumber");
            result.put("message", "PAN number is already registered with another account.");
            return result;
        }

        // 4. Duplicate Aadhar
        if (user.getAadharNumber() != null && userRepository.findByAadharNumber(user.getAadharNumber()) != null) {
            result.put("status", "error");
            result.put("field", "aadharNumber");
            result.put("message", "Aadhar number is already registered with another account.");
            return result;
        }

        // 5. Age validation (must be >= 18)
        if (user.getDateOfBirth() != null && !user.getDateOfBirth().isEmpty()) {
            try {
                LocalDate dob = LocalDate.parse(user.getDateOfBirth());
                int age = Period.between(dob, LocalDate.now()).getYears();
                if (age < 18) {
                    result.put("status", "error");
                    result.put("field", "dateOfBirth");
                    result.put("message", "You must be at least 18 years old to register. Current age: " + age);
                    return result;
                }
                if (dob.isAfter(LocalDate.now())) {
                    result.put("status", "error");
                    result.put("field", "dateOfBirth");
                    result.put("message", "Date of birth cannot be a future date.");
                    return result;
                }
            } catch (DateTimeParseException e) {
                result.put("status", "error");
                result.put("field", "dateOfBirth");
                result.put("message", "Invalid date of birth format. Please use YYYY-MM-DD.");
                return result;
            }
        }

        // 6. Terms must be accepted
        if (user.getTermsAccepted() == null || !user.getTermsAccepted()) {
            result.put("status", "error");
            result.put("field", "termsAccepted");
            result.put("message", "You must accept the Terms & Conditions to register.");
            return result;
        }

        // 7. Auto-set system fields
        long count = userRepository.count() + 1;
        String userCode = "MV" + String.format("%04d", count);
        user.setUserCode(userCode);
        user.setRole("USER");
        user.setKycStatus("PENDING");

        // 8. Set legacy name for compatibility
        if (user.getFirstName() != null && user.getLastName() != null) {
            user.setName(user.getFirstName() + " " + user.getLastName());
        } else if (user.getName() == null || user.getName().isEmpty()) {
            user.setName(user.getEmail());
        }

        // 9. Defaults
        if (user.getNationality() == null || user.getNationality().isEmpty()) user.setNationality("Indian");
        if (user.getCountry() == null || user.getCountry().isEmpty()) user.setCountry("India");
        if (user.getMarketingConsent() == null) user.setMarketingConsent(false);
        if (user.getPreferredAccountType() == null || user.getPreferredAccountType().isEmpty()) user.setPreferredAccountType("SAVINGS");

        userRepository.save(user);

        result.put("status", "success");
        result.put("message", "Account created successfully! Welcome to BugBank.");
        result.put("userCode", userCode);
        return result;
    }

    // ── LEGACY saveUser (kept for compatibility) ───────────────
    public User saveUser(User user) {
        Map<String, String> res = registerUser(user);
        if ("success".equals(res.get("status"))) {
            return userRepository.findByEmail(user.getEmail());
        }
        return null;
    }

    // ── LOGIN ─────────────────────────────────────────────────
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    // ── GET ALL USERS (ADMIN) ─────────────────────────────────
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── DELETE USER (WITH ALL DATA) ───────────────────────────
    public String deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";

        List<Account> accounts = accountRepository.findByUserId(userId);
        for (Account acc : accounts) accountRepository.delete(acc);

        List<Card> cards = cardRepository.findByUserId(userId);
        for (Card c : cards) cardRepository.delete(c);

        List<Loan> loans = loanRepository.findByUserId(userId);
        for (Loan l : loans) loanRepository.delete(l);

        List<Investment> investments = investmentRepository.findByUserId(userId);
        for (Investment i : investments) investmentRepository.delete(i);

        userRepository.delete(user);
        return "User deleted successfully";
    }
}