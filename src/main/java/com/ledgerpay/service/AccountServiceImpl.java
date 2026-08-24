package com.ledgerpay.service;

import com.ledgerpay.dto.response.AccountResponse;
import com.ledgerpay.entity.Account;
import com.ledgerpay.entity.User;
import com.ledgerpay.exception.AccountNotFoundException;
import com.ledgerpay.repository.AccountRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public AccountResponse getCurrentUserAccount() {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Account account = accountRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        return AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .upiId(account.getUpiId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }
}