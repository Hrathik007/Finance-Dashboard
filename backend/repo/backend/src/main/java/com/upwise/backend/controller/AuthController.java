package com.upwise.backend.controller;

import com.upwise.backend.dto.ApiResponse;
import com.upwise.backend.security.JwtUtil;
import com.upwise.backend.service.AuditService;
import com.upwise.backend.service.UserService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil, UserService userService, AuditService auditService) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.auditService = auditService;
    }

    public static class LoginRequest {
        @NotBlank
        public String username;
        @NotBlank
        public String password;
    }

    public static class LoginResponse { public String token; public LoginResponse(String t) { this.token = t; } }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username, req.password));
            List<String> roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
            String token = jwtUtil.generateToken(req.username, roles);
            // audit login
            try { auditService.log(req.username, "LOGIN"); } catch (Exception ignore) {}
            return ResponseEntity.ok(ApiResponse.ok(new LoginResponse(token)));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid username/password"));
        }
    }
}
