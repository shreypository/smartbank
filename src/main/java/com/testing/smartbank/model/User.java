package com.testing.smartbank.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userCode;

    // ── PERSONAL INFO ────────────────────────────────────────
    @Column(nullable = false)
    private String name;           // legacy full name (kept for compat)

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String dateOfBirth;    // format: YYYY-MM-DD

    @Column(nullable = false)
    private String gender;         // MALE / FEMALE / OTHER

    private String nationality;    // default: Indian

    // ── CONTACT ──────────────────────────────────────────────
    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String phone;          // 10-digit mobile

    private String alternatePhone; // optional 10-digit

    // ── ADDRESS ──────────────────────────────────────────────
    @Column(nullable = false)
    private String addressLine1;

    private String addressLine2;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;        // 6-digit

    private String country;        // default: India

    // ── IDENTITY / KYC ────────────────────────────────────────
    @Column(unique = true, nullable = false)
    private String panNumber;      // format: ABCDE1234F

    @Column(unique = true, nullable = false)
    private String aadharNumber;   // 12 digits (stored as string)

    // ── EMPLOYMENT / FINANCIAL ────────────────────────────────
    @Column(nullable = false)
    private String occupation;     // SALARIED / SELF_EMPLOYED / STUDENT / RETIRED / BUSINESS

    private String employerName;   // required if SALARIED / BUSINESS

    private Long annualIncome;     // in INR

    private String employmentType; // FULL_TIME / PART_TIME / CONTRACT / SELF

    // ── ACCOUNT PREFERENCES ───────────────────────────────────
    private String preferredAccountType; // SAVINGS / CURRENT / BUSINESS

    // ── NOMINEE ───────────────────────────────────────────────
    @Column(nullable = false)
    private String nomineeName;

    @Column(nullable = false)
    private String nomineeRelation; // SPOUSE / PARENT / CHILD / SIBLING / OTHER

    @Column(nullable = false)
    private String nomineeDob;

    private String nomineePhone;

    // ── SECURITY ──────────────────────────────────────────────
    @Column(nullable = false)
    private String password;

    private String securityQuestion;
    private String securityAnswer;

    // ── SYSTEM / STATUS ───────────────────────────────────────
    private String role;           // USER / ADMIN

    private String kycStatus;      // PENDING / VERIFIED / REJECTED

    private Boolean termsAccepted; // must be true

    private Boolean marketingConsent; // optional
}
