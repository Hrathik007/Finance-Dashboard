package com.upwise.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Base64;

@Component
public class JwtUtil {
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final Key key;
    private final long expirationMs;

    public JwtUtil(@Value("${jwt.secret:}") String base64SecretProp, @Value("${jwt.expiration-ms:14400000}") long expirationMs) {
        // Prefer environment variable SPRING_JWT_SECRET, then application property, then a dev fallback
        String env = System.getenv("SPRING_JWT_SECRET");
        String base64Secret = env != null && !env.isBlank() ? env : base64SecretProp;
        if (base64Secret == null || base64Secret.isBlank()) {
            // use a 256-bit (32 byte) ASCII fallback for development only
            base64Secret = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2NzgwMQ=="; // base64 for 32-byte ASCII string
            log.warn("No JWT secret provided via SPRING_JWT_SECRET or jwt.secret property — using insecure dev fallback (32 bytes). Do not use in production.");
        }

        Key tmpKey;
        try {
            byte[] secretBytes = Base64.getDecoder().decode(base64Secret);
            tmpKey = Keys.hmacShaKeyFor(secretBytes);
        } catch (IllegalArgumentException | WeakKeyException ex) {
            log.warn("Configured JWT secret is invalid or too weak: {} — generating a secure random key instead", ex.getMessage());
            tmpKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }

        this.key = tmpKey;
        this.expirationMs = expirationMs;
        log.info("JwtUtil initialized with expirationMs={}", expirationMs);
    }

    public String generateToken(String username, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("roles", roles);
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    public List<String> getRoles(String token) {
        Object r = parseToken(token).get("roles");
        if (r instanceof List) return (List<String>) r;
        return List.of();
    }

    public boolean isExpired(String token) {
        return parseToken(token).getExpiration().before(new Date());
    }
}
