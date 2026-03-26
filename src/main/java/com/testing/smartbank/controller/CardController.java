package com.testing.smartbank.controller;

import com.testing.smartbank.service.CardService;
import com.testing.smartbank.model.Card;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cards")
public class CardController {

    @Autowired
    private CardService cardService;

    @PostMapping("/apply")
    public String applyCard(@RequestParam String userCode,
                            @RequestParam String type) {
        return cardService.applyCard(userCode, type);
    }

    @GetMapping("/user")
    public List<Card> getCards(@RequestParam String userCode) {
        return cardService.getCards(userCode);
    }

    @DeleteMapping("/delete")
    public String deleteCard(@RequestParam Long cardId) {
        return cardService.deleteCard(cardId);
    }

}