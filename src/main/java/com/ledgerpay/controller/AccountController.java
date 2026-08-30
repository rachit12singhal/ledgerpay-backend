package com.ledgerpay.controller;

import com.ledgerpay.dto.request.DepositRequest;
import com.ledgerpay.dto.request.WithdrawRequest;
import com.ledgerpay.dto.response.AccountResponse;
import com.ledgerpay.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping("/deposit")
    public ResponseEntity<AccountResponse> deposit(@Valid @RequestBody DepositRequest request) {
        AccountResponse response = accountService.deposit(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<AccountResponse> withdraw(@Valid @RequestBody WithdrawRequest request) {
        AccountResponse response = accountService.withdraw(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{accountNumber}/freeze")
    public ResponseEntity<Void> freezeAccount(@PathVariable String accountNumber) {
        accountService.freezeAccount(accountNumber);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{accountNumber}/unfreeze")
    public ResponseEntity<Void> unfreezeAccount(@PathVariable String accountNumber) {
        accountService.unfreezeAccount(accountNumber);
        return ResponseEntity.ok().build();
    }

}