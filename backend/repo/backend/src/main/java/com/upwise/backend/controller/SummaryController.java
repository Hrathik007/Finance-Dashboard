package com.upwise.backend.controller;

import com.upwise.backend.dto.ApiResponse;
import com.upwise.backend.model.User;
import com.upwise.backend.service.AnalyticsService;
import com.upwise.backend.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SummaryController {
    private final AnalyticsService analyticsService;
    private final UserService userService;

    public SummaryController(AnalyticsService analyticsService, UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    private User resolveUserFromPrincipal(UserDetails principal) {
        if (principal == null) return null;
        return userService.findByUsername(principal.getUsername()).orElse(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    @GetMapping("/api/summary")
    public ApiResponse<Map<String, Object>> summary(@AuthenticationPrincipal UserDetails principal) {
        User user = resolveUserFromPrincipal(principal);
        Map<String, Object> res = analyticsService.getOverallSummary(user);
        return ApiResponse.ok(res);
    }
}
