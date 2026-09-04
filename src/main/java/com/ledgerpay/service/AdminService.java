package com.ledgerpay.service;

import com.ledgerpay.dto.response.AdminAccountResponse;
import com.ledgerpay.dto.response.TransactionResponse;

import java.util.List;

public interface AdminService {

    List<AdminAccountResponse> getAllAccounts();

    List<TransactionResponse> getAllTransactions();
}

