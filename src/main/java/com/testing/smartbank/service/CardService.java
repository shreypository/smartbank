package com.testing.smartbank.service;

import com.testing.smartbank.model.*;
import com.testing.smartbank.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private UserRepository userRepository;

    // 🔥 APPLY CARD
    public String applyCard(String userCode, String type) {

        User user = userRepository.findByUserCode(userCode);
        if (user == null) return "Invalid user";

        // 🔒 Only one of each type
        List<Card> existing = cardRepository.findByUserIdAndCardType(user.getId(), type);
        if (!existing.isEmpty()) {
            return type + " card already exists";
        }

        Card card = new Card();
        card.setUser(user);
        card.setCardType(type);
        card.setNameOnCard(user.getName());

        // 💳 Generate random details
        card.setCardNumber(generateCardNumber());
        card.setExpiry("12/30");
        card.setCvv(String.valueOf(new Random().nextInt(900) + 100));

        cardRepository.save(card);

        return type + " card issued successfully";
    }

    private String generateCardNumber() {
        StringBuilder sb = new StringBuilder();
        Random rand = new Random();

        for (int i = 0; i < 16; i++) {
            sb.append(rand.nextInt(10));
        }

        return sb.toString();
    }

    // 🔥 GET CARDS
    public List<Card> getCards(String userCode) {
        User user = userRepository.findByUserCode(userCode);
        return cardRepository.findByUserId(user.getId());
    }

    public String deleteCard(Long cardId) {

        Card card = cardRepository.findById(cardId).orElse(null);

        if (card == null) return "Card not found";

        cardRepository.delete(card);

        return "Card cancelled successfully";
    }
}