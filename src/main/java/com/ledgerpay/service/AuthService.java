package com.ledgerpay.service;

import com.ledgerpay.dto.request.LoginRequest;
import com.ledgerpay.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}