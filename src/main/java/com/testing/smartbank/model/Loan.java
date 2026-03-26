package com.testing.smartbank.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 🔥 REQUIRED

    private double totalAmount;
    private double remainingAmount;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}