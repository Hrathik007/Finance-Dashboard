package com.upwise.backend.controller;

import com.upwise.backend.dto.ApiResponse;
import com.upwise.backend.model.AuditLog;
import com.upwise.backend.service.AuditService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {
    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<List<AuditLog>> recent() {
        return ApiResponse.ok(auditService.recent());
    }
}

