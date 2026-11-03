
package com.mentora.security;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMillis = 1000L * 60 * 60;

    public JwtService() {
        String secret = System.getenv("MENTORA_JWT_SECRET");

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                "MENTORA_JWT_SECRET environment variable is not configured"
            );
        }

        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {

        Instant now = Instant.now();

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(
                    now.plus(expirationMillis, ChronoUnit.MILLIS)
                ))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String email) {
        Claims claims = extractClaims(token);

        return claims.getSubject().equals(email)
                && claims.getExpiration().after(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
