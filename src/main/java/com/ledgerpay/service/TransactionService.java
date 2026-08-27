package com.ledgerpay.service;

import com.ledgerpay.dto.request.TransferRequest;
import com.ledgerpay.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {

    TransactionResponse transfer(TransferRequest request);

    List<TransactionResponse> getMyTransactions();

}