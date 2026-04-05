package com.upwise.backend.controller;

import com.upwise.backend.dto.ApiResponse;
import com.upwise.backend.dto.UserDTO;
import com.upwise.backend.dto.UserResponse;
import com.upwise.backend.model.User;
import com.upwise.backend.service.AuditService;
import com.upwise.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final AuditService auditService;

    public UserController(UserService userService, AuditService auditService) {
        this.userService = userService;
        this.auditService = auditService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@AuthenticationPrincipal UserDetails principal, @Valid @RequestBody UserDTO dto) {
        User u = new User(dto.getUsername(), dto.getPassword());
        u.setEmail(dto.getEmail());
        u.setActive(dto.isActive());
        User created = userService.createUser(u, dto.getRoles() == null ? List.of() : dto.getRoles());
        try { auditService.log(created.getUsername(), "USER_CREATE"); } catch (Exception ignore) {}
        try { if (principal != null) auditService.log(principal.getUsername(), "USER_CREATE_ACTOR:" + created.getUsername()); } catch (Exception ignore) {}
        return ResponseEntity.created(URI.create("/api/users/" + created.getId())).body(ApiResponse.ok(toDto(created)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<List<UserResponse>> listUsers(@AuthenticationPrincipal UserDetails principal) {
        try { if (principal != null) auditService.log(principal.getUsername(), "USER_LIST"); } catch (Exception ignore) {}
        List<UserResponse> list = userService.listAll().stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok(list);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ApiResponse<UserResponse> updateStatus(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id, @RequestParam boolean active) {
        User u = userService.updateStatus(id, active);
        try { auditService.log(u.getUsername(), "USER_UPDATE"); } catch (Exception ignore) {}
        try { if (principal != null) auditService.log(principal.getUsername(), "USER_UPDATE_ACTOR:" + u.getUsername()); } catch (Exception ignore) {}
        return ApiResponse.ok(toDto(u));
    }

    private UserResponse toDto(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setActive(u.isActive());
        r.setRoles(u.getRoles().stream().map(x -> x.getName()).collect(Collectors.toList()));
        return r;
    }
}
