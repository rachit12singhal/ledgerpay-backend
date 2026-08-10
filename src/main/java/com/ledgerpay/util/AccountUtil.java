package com.ledgerpay.util;

import java.security.SecureRandom;

public class AccountUtil {

    private static final SecureRandom RANDOM = new SecureRandom();

    private static final int ACCOUNT_NUMBER_LENGTH = 12;

    private static final int UPI_SUFFIX_LENGTH = 4;

    private static final String UPI_DOMAIN = "@ledgerpay";

    public String generateAccountNumber() {
        StringBuilder accountNumber = new StringBuilder(ACCOUNT_NUMBER_LENGTH);
        for (int i = 0; i < ACCOUNT_NUMBER_LENGTH; i++) {
            accountNumber.append(RANDOM.nextInt(10));
        }
        return accountNumber.toString();
    }

    public String generateUpiId(String fullName) {
        String normalizedName = normalizeFullName(fullName);
        String randomSuffix = generateRandomSuffix();
        return normalizedName + randomSuffix + UPI_DOMAIN;
    }

    private String normalizeFullName(String fullName) {
        return fullName
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
    }

    private String generateRandomSuffix() {
        StringBuilder suffix = new StringBuilder(UPI_SUFFIX_LENGTH);
        for (int i = 0; i < UPI_SUFFIX_LENGTH; i++) {
            suffix.append(RANDOM.nextInt(10));
        }
        return suffix.toString();
    }

}