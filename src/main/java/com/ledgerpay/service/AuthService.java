package com.ledgerpay.service;

import com.ledgerpay.dto.LoginRequest;
import com.ledgerpay.dto.UserResponse;

public interface AuthService {

    UserResponse login(LoginRequest request);

}