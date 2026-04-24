package com.testing.smartbank.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String investmentName;

    private double amountInvested;

    // % locked at time of investment
    private double baseReturnPercentage;

    // 🔥 FINAL % after bonus/penalty (calculated at withdrawal)
    private Double finalReturnPercentage;

    // 🔥 When investment was made
    private LocalDateTime investedAt;

    // 🔥 Lock-in period in seconds
    private int lockInSeconds;

    // 🔥 Status: PENDING, ACTIVE, WITHDRAWN, EXPIRED
    private String status;

    // 🔥 Risk type: LOW, MEDIUM, HIGH
    private String riskType;

    // 🔥 Bonus / penalty configs
    private double earlyWithdrawalPenalty; // %
    private double maturityBonus; // %

    // 🔥 Audit
    private LocalDateTime withdrawnAt;

    // 🔥 Failure simulation flag
    private boolean flagged;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}