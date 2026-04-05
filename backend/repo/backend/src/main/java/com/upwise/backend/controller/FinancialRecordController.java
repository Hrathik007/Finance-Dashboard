package com.upwise.backend.controller;

import com.upwise.backend.dto.ApiResponse;
import com.upwise.backend.dto.FinancialRecordDTO;
import com.upwise.backend.dto.FinancialRecordResponse;
import com.upwise.backend.dto.PaginatedResponse;
import com.upwise.backend.model.FinancialRecord;
import com.upwise.backend.model.User;
import com.upwise.backend.service.FinancialRecordService;
import com.upwise.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/records")
public class FinancialRecordController {
    private final FinancialRecordService service;
    private final UserService userService; // to resolve current user

    public FinancialRecordController(FinancialRecordService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    private User resolveUserFromPrincipal(UserDetails principal) {
        if (principal == null) return null;
        return userService.findByUsername(principal.getUsername()).orElse(null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserDetails principal, @Valid @RequestBody FinancialRecordDTO dto) {
        User user = resolveUserFromPrincipal(principal);
        FinancialRecord fr = new FinancialRecord(dto.getAmount(), dto.getType(), dto.getCategory(), dto.getDate());
        fr.setNotes(dto.getNotes());
        FinancialRecord created = service.create(user, fr);
        return ResponseEntity.created(URI.create("/api/records/" + created.getId())).body(ApiResponse.ok(service.toDto(created)));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','VIEWER')")
    @GetMapping
    public ApiResponse<PaginatedResponse<FinancialRecordResponse>> listAll(@AuthenticationPrincipal UserDetails principal, Pageable pageable) {
        User user = resolveUserFromPrincipal(principal);
        Page<FinancialRecord> page = service.listAll(user, pageable);
        List<FinancialRecordResponse> content = page.stream().map(service::toDto).toList();
        PaginatedResponse<FinancialRecordResponse> pr = new PaginatedResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
        return ApiResponse.ok(pr);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ApiResponse<FinancialRecordResponse> update(@AuthenticationPrincipal UserDetails principal, @Valid @RequestBody FinancialRecordDTO dto) {
        User user = resolveUserFromPrincipal(principal);
        FinancialRecord fr = new FinancialRecord(dto.getAmount(), dto.getType(), dto.getCategory(), dto.getDate());
        fr.setNotes(dto.getNotes());
        fr.setId(dto.getId());
        FinancialRecord updated = service.update(user, fr);
        return ApiResponse.ok(service.toDto(updated));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User user = resolveUserFromPrincipal(principal);
        service.softDelete(user, id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','VIEWER')")
    @GetMapping("/filter")
    public ApiResponse<PaginatedResponse<FinancialRecordResponse>> filter(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) FinancialRecord.RecordType type,
            Pageable pageable
    ) {
        User user = resolveUserFromPrincipal(principal);
        Page<FinancialRecord> page = service.filter(user, start, end, category, type, pageable);
        List<FinancialRecordResponse> content = page.stream().map(service::toDto).toList();
        PaginatedResponse<FinancialRecordResponse> pr = new PaginatedResponse<>(content, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
        return ApiResponse.ok(pr);
    }
}
