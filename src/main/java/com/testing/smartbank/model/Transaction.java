package com.testing.smartbank.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Custom Transaction ID (for searching)
    private String transactionId;

    // 🔥 Type: DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT
    private String type;

    // 🔥 Category: grocery, loan, investment, etc.
    private String category;

    private double amount;

    private LocalDateTime timestamp;

    // 🔥 Sender account (for transfers)
    @ManyToOne
    @JoinColumn(name = "sender_account_id")
    @JsonIgnore
    private Account sender;

    // 🔥 Receiver account (for transfers)
    @ManyToOne
    @JoinColumn(name = "receiver_account_id")
    @JsonIgnore
    private Account receiver;

    // 🔥 Keep this for deposit/withdraw compatibility
    @ManyToOne
    @JoinColumn(name = "account_id")
    @JsonIgnore
    private Account account;
}