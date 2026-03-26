package com.testing.smartbank.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cardNumber;
    private String expiry;
    private String cvv;
    private String cardType; // DEBIT / CREDIT
    private String nameOnCard;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}