package com.ledgerpay.service;

import com.ledgerpay.dto.RegisterRequest;
import com.ledgerpay.dto.UserResponse;

public interface UserService {

    UserResponse registerUser(RegisterRequest request);

}