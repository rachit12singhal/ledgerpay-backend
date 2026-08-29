package com.ledgerpay.service;

import com.ledgerpay.dto.request.TransferRequest;
import com.ledgerpay.dto.response.TransactionResponse;
import com.ledgerpay.entity.*;
import com.ledgerpay.exception.AccountNotFoundException;
import com.ledgerpay.exception.InsufficientBalanceException;
import com.ledgerpay.exception.InvalidTransferException;
import com.ledgerpay.repository.AccountRepository;
import com.ledgerpay.repository.TransactionRepository;
import com.ledgerpay.service.TransactionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request) {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Account sender = accountRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        if (sender.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Sender account is not active");
        }

        String accountNumber = request.getRecipientAccountNumber();
        String upiId = request.getRecipientUpiId();

        boolean hasAccountNumber = accountNumber != null && !accountNumber.isBlank();
        boolean hasUpiId = upiId != null && !upiId.isBlank();

        if (hasAccountNumber == hasUpiId) {
            throw new InvalidTransferException(
                    "Provide exactly one of recipientAccountNumber or recipientUpiId");
        }

        Account receiver = hasAccountNumber
                ? accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found with the given account number"))
                : accountRepository.findByUpiId(upiId)
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found with the given UPI ID"));

        if (receiver.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidTransferException("Recipient account is not active");
        }

        if (sender.getId().equals(receiver.getId())) {
            throw new InvalidTransferException("Cannot transfer to the same account");
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransferException("Transfer amount must be greater than zero");
        }

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for this transfer");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transaction transaction = Transaction.builder()
                .sender(sender)
                .receiver(receiver)
                .amount(amount)
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.SUCCESS)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        return mapToResponse(savedTransaction);
    }

    @Override
    public List<TransactionResponse> getMyTransactions() {

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Account account = accountRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new AccountNotFoundException(
                        "No account found for the authenticated user"));

        List<Transaction> transactions = transactionRepository
                .findBySender_IdOrReceiver_IdOrderByCreatedAtDesc(account.getId(), account.getId());

        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
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