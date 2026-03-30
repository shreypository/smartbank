package com.testing.smartbank.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String investmentName;
    private double amountInvested;
    private double returnAmount;

    // 🔥 NEW FIELD
    private double returnPercentage;

    private boolean withdrawn;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}