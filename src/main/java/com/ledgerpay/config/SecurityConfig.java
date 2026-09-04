package com.ledgerpay.config;

import com.ledgerpay.dto.ErrorResponse;
import com.ledgerpay.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint((request, response, authException) -> {

                            ErrorResponse errorResponse = ErrorResponse.builder()
                                    .status(HttpStatus.UNAUTHORIZED.value())
                                    .message("Authentication required")
                                    .timestamp(LocalDateTime.now())
                                    .build();

                            writeErrorResponse(
                                    response,
                                    errorResponse,
                                    HttpStatus.UNAUTHORIZED
                            );
                        })

                        .accessDeniedHandler((request, response, accessDeniedException) -> {

                            ErrorResponse errorResponse = ErrorResponse.builder()
                                    .status(HttpStatus.FORBIDDEN.value())
                                    .message("Access denied")
                                    .timestamp(LocalDateTime.now())
                                    .build();

                            writeErrorResponse(
                                    response,
                                    errorResponse,
                                    HttpStatus.FORBIDDEN
                            );
                        })
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                "/api/account/*/freeze",
                                "/api/account/*/unfreeze"
                        ).hasAuthority("ADMIN")

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    private void writeErrorResponse(
            HttpServletResponse response,
            ErrorResponse errorResponse,
            HttpStatus status) throws IOException {

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String json = "{"
                + "\"status\":" + errorResponse.getStatus() + ","
                + "\"message\":\"" + errorResponse.getMessage() + "\","
                + "\"timestamp\":\"" + errorResponse.getTimestamp() + "\""
                + "}";

        response.getWriter().write(json);
    }
}