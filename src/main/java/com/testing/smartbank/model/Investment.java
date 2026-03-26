package com.testing.smartbank.model;

import com.testing.smartbank.model.Account;
import com.testing.smartbank.model.User;
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
    private boolean withdrawn;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // 🔥 ADD THIS
    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}