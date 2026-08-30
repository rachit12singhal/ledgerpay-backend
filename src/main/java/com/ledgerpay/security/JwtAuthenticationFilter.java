package com.ledgerpay.security;

import com.ledgerpay.entity.User;
import com.ledgerpay.repository.UserRepository;
import com.ledgerpay.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtUtil.isTokenValid(token)) {

            String email = jwtUtil.extractEmail(token);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                Optional<User> userOptional = userRepository.findByEmail(email);

                if (userOptional.isPresent()) {

                    User user = userOptional.get();

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    List.of(
                                            new SimpleGrantedAuthority(
                                                    user.getRole().name()
                                            )
                                    )
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}