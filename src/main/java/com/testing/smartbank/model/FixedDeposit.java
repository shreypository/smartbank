package com.testing.smartbank.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
public class FixedDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountCode;
    private Long accountId;

    private Double amount;
    private Double interestRate;
    private Integer durationMonths;

    private LocalDate startDate;
    private LocalDate maturityDate;

    private Double maturityAmount;

    private String status; // ACTIVE, MATURED, CLOSED
}