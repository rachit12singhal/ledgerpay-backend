package com.ledgerpay.controller;

import com.ledgerpay.dto.response.AccountResponse;
import com.ledgerpay.service.AccountService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public AccountResponse getAccount() {
        return accountService.getCurrentUserAccount();
    }
}