package com.ledgerpay.service.impl;

import com.ledgerpay.dto.RegisterRequest;
import com.ledgerpay.dto.UserResponse;
import com.ledgerpay.entity.Account;
import com.ledgerpay.entity.AccountStatus;
import com.ledgerpay.entity.Role;
import com.ledgerpay.entity.User;
import com.ledgerpay.exception.EmailAlreadyExistsException;
import com.ledgerpay.repository.AccountRepository;
import com.ledgerpay.repository.UserRepository;
import com.ledgerpay.service.UserService;
import com.ledgerpay.util.AccountUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountUtil accountUtil;

    public UserServiceImpl(UserRepository userRepository,
                           AccountRepository accountRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.accountUtil = new AccountUtil();
    }

    @Override
    @Transactional
    public UserResponse registerUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(
                    "Email already registered: " + request.getEmail());
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .fullname(request.getFullName())
                .email(request.getEmail())
                .password(encodedPassword)
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        String accountNumber = accountUtil.generateAccountNumber();
        while (accountRepository.existsByAccountNumber(accountNumber)) {
            accountNumber = accountUtil.generateAccountNumber();
        }

        String upiId = accountUtil.generateUpiId(savedUser.getFullname());
        while (accountRepository.existsByUpiId(upiId)) {
            upiId = accountUtil.generateUpiId(savedUser.getFullname());
        }

        Account account = Account.builder()
                .user(savedUser)
                .accountNumber(accountNumber)
                .upiId(upiId)
                .balance(BigDecimal.ZERO)
                .status(AccountStatus.ACTIVE)
                .build();

        accountRepository.save(account);

        return UserResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullname())
                .email(savedUser.getEmail())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

}