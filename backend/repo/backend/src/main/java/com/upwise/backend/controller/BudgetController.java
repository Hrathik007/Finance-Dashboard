package com.upwise.backend.controller;

import com.upwise.backend.dto.ApiResponse;
import com.upwise.backend.dto.BudgetDTO;
import com.upwise.backend.model.User;
import com.upwise.backend.service.BudgetService;
import com.upwise.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {
    private final BudgetService budgetService;
    private final UserService userService;

    public BudgetController(BudgetService budgetService, UserService userService) {
        this.budgetService = budgetService;
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody BudgetDTO dto) {
        var b = budgetService.createOrUpdateBudget(dto);
        return ResponseEntity.created(URI.create("/api/budget/" + b.getId())).body(ApiResponse.ok(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> getStatus(@RequestParam Long userId) {
        Map<String, Object> res = budgetService.getBudgetStatus(userId);
        return ApiResponse.ok(res);
    }
}

