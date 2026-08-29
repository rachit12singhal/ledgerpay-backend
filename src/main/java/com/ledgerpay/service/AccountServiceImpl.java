package com.ledgerpay.service;

import com.ledgerpay.dto.request.DepositRequest;
import com.ledgerpay.dto.request.WithdrawRequest;
import com.ledgerpay.dto.response.AccountResponse;
import com.ledgerpay.entity.Account;
import com.ledgerpay.entity.AccountStatus;
import com.ledgerpay.entity.User;
import com.ledgerpay.exception.AccountNotFoundException;
import com.ledgerpay.exception.InsufficientBalanceException;
import com.ledgerpay.exception.InvalidTransferException;
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

    @Override
    public AccountResponse deposit(DepositRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Account account = accountRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Account is not active");
        }

        account.setBalance(account.getBalance().add(request.getAmount()));

        accountRepository.save(account);

        return AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .upiId(account.getUpiId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }

    @Override
    public AccountResponse withdraw(WithdrawRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Account account = accountRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Account is not active");
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for this withdrawal");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));

        accountRepository.save(account);

        return AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .upiId(account.getUpiId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }

}