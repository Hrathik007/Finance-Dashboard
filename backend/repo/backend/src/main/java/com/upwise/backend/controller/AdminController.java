package com.upwise.backend.controller;

import com.upwise.backend.bootstrap.DataInitializer;
import com.upwise.backend.dto.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final DataInitializer dataInitializer;

    public AdminController(DataInitializer dataInitializer) {
        this.dataInitializer = dataInitializer;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/seed")
    public ApiResponse<String> seed() {
        dataInitializer.seedDemo();
        return ApiResponse.ok("seeded");
    }
}

