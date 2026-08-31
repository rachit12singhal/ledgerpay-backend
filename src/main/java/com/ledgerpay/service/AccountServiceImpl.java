package com.ledgerpay.service;

import com.ledgerpay.dto.request.DepositRequest;
import com.ledgerpay.dto.request.WithdrawRequest;
import com.ledgerpay.dto.response.AccountResponse;
import com.ledgerpay.entity.Account;
import com.ledgerpay.entity.AccountStatus;
import com.ledgerpay.entity.Transaction;
import com.ledgerpay.entity.TransactionStatus;
import com.ledgerpay.entity.TransactionType;
import com.ledgerpay.entity.User;
import com.ledgerpay.exception.AccountNotFoundException;
import com.ledgerpay.exception.InsufficientBalanceException;
import com.ledgerpay.exception.InvalidTransferException;
import com.ledgerpay.repository.AccountRepository;
import com.ledgerpay.repository.TransactionRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AccountServiceImpl(AccountRepository accountRepository,
                              TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
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
    @Transactional
    public AccountResponse deposit(DepositRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        // Lock the account row while modifying the balance
        Account account = accountRepository.findByUserIdForUpdate(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Account is not active");
        }

        account.setBalance(account.getBalance().add(request.getAmount()));

        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .sender(account)
                .receiver(account)
                .amount(request.getAmount())
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .build();

        transactionRepository.save(transaction);

        return AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .upiId(account.getUpiId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }

    @Override
    @Transactional
    public AccountResponse withdraw(WithdrawRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        // Lock the account row while modifying the balance
        Account account = accountRepository.findByUserIdForUpdate(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Account is not active");
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance for this withdrawal");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));

        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .sender(account)
                .receiver(account)
                .amount(request.getAmount())
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.SUCCESS)
                .build();

        transactionRepository.save(transaction);

        return AccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .upiId(account.getUpiId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }

    @Override
    public void freezeAccount(String accountNumber) {

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found with the given account number"));

        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new InvalidTransferException("Account is already frozen");
        }

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidTransferException("Closed account cannot be frozen");
        }

        account.setStatus(AccountStatus.FROZEN);

        accountRepository.save(account);
    }

    @Override
    public void unfreezeAccount(String accountNumber) {

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found with the given account number"));

        if (account.getStatus() == AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Account is already active");
        }

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidTransferException("Closed account cannot be unfrozen");
        }

        account.setStatus(AccountStatus.ACTIVE);

        accountRepository.save(account);
    }
}