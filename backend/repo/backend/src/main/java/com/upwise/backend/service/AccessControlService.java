package com.upwise.backend.service;

import com.upwise.backend.model.User;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {

    // Simplified role checks based on role names. In real apps integrate with Spring Security.
    public boolean canCreateOrModify(User user) {
        if (user == null || !user.isActive()) return false;
        return user.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN"));
    }

    public boolean canRead(User user) {
        if (user == null || !user.isActive()) return false;
        return user.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN")
                || r.getName().equalsIgnoreCase("ROLE_ANALYST")
                || r.getName().equalsIgnoreCase("ROLE_VIEWER"));
    }

    public boolean canAccessSummaries(User user) {
        if (user == null || !user.isActive()) return false;
        return user.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_ADMIN")
                || r.getName().equalsIgnoreCase("ROLE_ANALYST"));
    }
}

