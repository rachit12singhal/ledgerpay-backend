package com.ledgerpay.service;

import com.ledgerpay.dto.response.AdminAccountResponse;
import com.ledgerpay.dto.response.TransactionResponse;
import com.ledgerpay.entity.Account;
import com.ledgerpay.entity.Transaction;
import com.ledgerpay.repository.AccountRepository;
import com.ledgerpay.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AdminServiceImpl(AccountRepository accountRepository,
                            TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public List<AdminAccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(this::mapToAdminAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    private AdminAccountResponse mapToAdminAccountResponse(Account account) {
        return AdminAccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .upiId(account.getUpiId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .ownerId(account.getUser().getId())
                .ownerFullName(account.getUser().getFullname())
                .ownerEmail(account.getUser().getEmail())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .senderAccountNumber(transaction.getSender().getAccountNumber())
                .receiverAccountNumber(transaction.getReceiver().getAccountNumber())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

}