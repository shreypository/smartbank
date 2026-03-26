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

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {

        User savedUser = userService.saveUser(user);

        if (savedUser != null) {
            return "User registered successfully";
        } else {
            return "Email already exists";
        }
    }

    @PostMapping("/login")
    public Object loginUser(@RequestBody User user) {
        User loggedInUser = userService.login(user.getEmail(), user.getPassword());

        if (loggedInUser != null) {
            return loggedInUser; // 🔥 return full user
        } else {
            return "Invalid email or password";
        }
    }
    @GetMapping("/all")
    public List<Map<String, Object>> getAllUsers() {

        List<User> users = userService.getAllUsers();

        return users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("userCode", u.getUserCode());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("password", u.getPassword()); // ⚠️ exposed
            map.put("role", u.getRole());

            return map;
        }).collect(Collectors.toList());
    }

    @DeleteMapping("/delete")
    public String deleteUser(@RequestParam Long userId) {
        return userService.deleteUser(userId);
    }

}