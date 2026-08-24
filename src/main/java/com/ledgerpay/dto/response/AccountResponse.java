package com.ledgerpay.dto.response;

import com.ledgerpay.entity.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private String accountNumber;

    private String upiId;

    private BigDecimal balance;

    private AccountStatus status;

}