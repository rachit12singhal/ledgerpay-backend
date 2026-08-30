package com.ledgerpay.service;

import com.ledgerpay.dto.request.DepositRequest;
import com.ledgerpay.dto.request.WithdrawRequest;
import com.ledgerpay.dto.response.AccountResponse;

public interface AccountService {

    AccountResponse getCurrentUserAccount();

    AccountResponse deposit(DepositRequest request);

    AccountResponse withdraw(WithdrawRequest request);

    void freezeAccount(String accountNumber);

    void unfreezeAccount(String accountNumber);

}