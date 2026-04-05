package com.upwise.backend.service;

import com.upwise.backend.model.AuditLog;
import com.upwise.backend.repository.AuditRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AuditService {
    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public void log(String username, String action) {
        AuditLog a = new AuditLog(username, action, Instant.now());
        auditRepository.save(a);
    }

    public List<AuditLog> recent() {
        return auditRepository.findTop100ByOrderByTimestampDesc();
    }
}

