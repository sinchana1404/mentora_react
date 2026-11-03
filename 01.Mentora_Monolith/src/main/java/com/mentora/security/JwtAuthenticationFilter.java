
package com.mentora.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // Skip JWT filtering for SockJS handshake requests.
    // STOMP CONNECT authentication is still handled by WebSocketJwtInterceptor.
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.equals("/ws") || path.startsWith("/ws/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("REQUEST: " + request.getMethod()
                + " " + request.getRequestURI());

        System.out.println("AUTH HEADER PRESENT: "
                + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("JWT: Authorization header missing");

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            String email = jwtService.extractEmail(token);

            boolean valid = email != null
                    && jwtService.isTokenValid(token, email);

            System.out.println("JWT EMAIL: " + email);
            System.out.println("TOKEN VALID: " + valid);

            if (!valid) {
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println("JWT AUTHENTICATION SET");
            }

        } catch (JwtException | IllegalArgumentException e) {

            System.out.println("JWT ERROR: " + e.getMessage());

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
