package com.ledgerpay.repository;

import com.ledgerpay.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    boolean existsByAccountNumber(String accountNumber);

    boolean existsByUpiId(String upiId);

    Optional<Account> findByUser_Id(Long userId);

}