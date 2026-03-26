package com.testing.smartbank.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountNumber;

    private String accountType; // SAVINGS / CURRENT / BUSINESS

    private double balance;


    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}

