package com.testing.smartbank.repository;

import com.testing.smartbank.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByUserId(Long userId);
    List<Card> findByUserIdAndCardType(Long userId, String cardType);
}