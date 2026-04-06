package com.testing.smartbank.controller;

import com.testing.smartbank.model.User;
import com.testing.smartbank.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ── REGISTER ────────────────────────────────────────────────
    @PostMapping("/register")
    public Map<String, String> registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // ── LOGIN ────────────────────────────────────────────────────
    @PostMapping("/login")
    public Object loginUser(@RequestBody User user) {
        User loggedInUser = userService.login(user.getEmail(), user.getPassword());
        if (loggedInUser != null) {
            return loggedInUser;
        }
        Map<String, String> err = new HashMap<>();
        err.put("status", "error");
        err.put("message", "Invalid email or password");
        return err;
    }

    // ── ALL USERS (ADMIN) ────────────────────────────────────────
    @GetMapping("/all")
    public List<Map<String, Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("userCode", u.getUserCode());
            map.put("name", u.getName());
            map.put("firstName", u.getFirstName());
            map.put("lastName", u.getLastName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("dateOfBirth", u.getDateOfBirth());
            map.put("gender", u.getGender());
            map.put("nationality", u.getNationality());
            map.put("addressLine1", u.getAddressLine1());
            map.put("addressLine2", u.getAddressLine2());
            map.put("city", u.getCity());
            map.put("state", u.getState());
            map.put("pincode", u.getPincode());
            map.put("country", u.getCountry());
            map.put("panNumber", u.getPanNumber());
            map.put("aadharNumber", u.getAadharNumber());
            map.put("occupation", u.getOccupation());
            map.put("employerName", u.getEmployerName());
            map.put("annualIncome", u.getAnnualIncome());
            map.put("employmentType", u.getEmploymentType());
            map.put("preferredAccountType", u.getPreferredAccountType());
            map.put("nomineeName", u.getNomineeName());
            map.put("nomineeRelation", u.getNomineeRelation());
            map.put("nomineeDob", u.getNomineeDob());
            map.put("nomineePhone", u.getNomineePhone());
            map.put("securityQuestion", u.getSecurityQuestion());
            map.put("kycStatus", u.getKycStatus());
            map.put("role", u.getRole());
            map.put("termsAccepted", u.getTermsAccepted());
            map.put("marketingConsent", u.getMarketingConsent());
            map.put("password", u.getPassword()); // ⚠️ exposed intentionally for bug-testing
            return map;
        }).collect(Collectors.toList());
    }

    // ── DELETE USER ──────────────────────────────────────────────
    @DeleteMapping("/delete")
    public String deleteUser(@RequestParam Long userId) {
        return userService.deleteUser(userId);
    }
}