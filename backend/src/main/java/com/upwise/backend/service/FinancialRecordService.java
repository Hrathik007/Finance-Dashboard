package com.upwise.backend.service;

import com.upwise.backend.dto.FinancialRecordResponse;
import com.upwise.backend.exception.ResourceNotFoundException;
import com.upwise.backend.exception.UnauthorizedException;
import com.upwise.backend.model.FinancialRecord;
import com.upwise.backend.model.FinancialRecord.RecordType;
import com.upwise.backend.model.User;
import com.upwise.backend.repository.FinancialRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinancialRecordService {
    private final FinancialRecordRepository repo;
    private final AccessControlService accessControlService;
    private final AuditService auditService;

    public FinancialRecordService(FinancialRecordRepository repo, AccessControlService accessControlService, AuditService auditService) {
        this.repo = repo;
        this.accessControlService = accessControlService;
        this.auditService = auditService;
    }

    public FinancialRecord create(User user, FinancialRecord record) {
        if (user == null) throw new UnauthorizedException("Unauthenticated");
        if (!accessControlService.canCreateOrModify(user)) throw new AccessDeniedException("Forbidden");
        FinancialRecord saved = repo.save(record);
        try { auditService.log(user.getUsername(), "CREATE_RECORD"); } catch (Exception ignore) {}
        return saved;
    }

    public FinancialRecord update(User user, FinancialRecord record) {
        if (user == null) throw new UnauthorizedException("Unauthenticated");
        if (!accessControlService.canCreateOrModify(user)) throw new AccessDeniedException("Forbidden");
        FinancialRecord existing = repo.findById(record.getId()).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        existing.setAmount(record.getAmount());
        existing.setCategory(record.getCategory());
        existing.setDate(record.getDate());
        existing.setNotes(record.getNotes());
        existing.setType(record.getType());
        FinancialRecord saved = repo.save(existing);
        try { auditService.log(user.getUsername(), "UPDATE_RECORD"); } catch (Exception ignore) {}
        return saved;
    }

    @Transactional
    public void softDelete(User user, Long id) {
        if (user == null) throw new UnauthorizedException("Unauthenticated");
        if (!accessControlService.canCreateOrModify(user)) throw new AccessDeniedException("Forbidden");
        FinancialRecord existing = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        existing.setDeleted(true);
        try { auditService.log(user.getUsername(), "DELETE_RECORD"); } catch (Exception ignore) {}
    }

    public Page<FinancialRecord> listAll(User user, Pageable pageable) {
        Specification<FinancialRecord> spec = (root, query, cb) -> cb.isFalse(root.get("deleted"));
        return repo.findAll(spec, pageable);
    }

    public Page<FinancialRecord> filter(User user, LocalDate start, LocalDate end, String category, RecordType type, Pageable pageable) {
        Specification<FinancialRecord> spec = (root, query, cb) -> cb.isFalse(root.get("deleted"));
        if (start != null && end != null) {
            Specification<FinancialRecord> dateSpec = (root, query, cb) -> cb.between(root.get("date"), start, end);
            spec = spec.and(dateSpec);
        }
        if (category != null && !category.isBlank()) {
            Specification<FinancialRecord> catSpec = (root, query, cb) -> cb.equal(cb.lower(root.get("category")), category.toLowerCase());
            spec = spec.and(catSpec);
        }
        if (type != null) {
            Specification<FinancialRecord> typeSpec = (root, query, cb) -> cb.equal(root.get("type"), type);
            spec = spec.and(typeSpec);
        }
        return repo.findAll(spec, pageable);
    }

    // summary moved to AnalyticsService

    public FinancialRecordResponse toDto(FinancialRecord fr) {
        FinancialRecordResponse dto = new FinancialRecordResponse();
        dto.setId(fr.getId());
        dto.setAmount(fr.getAmount());
        dto.setCategory(fr.getCategory());
        dto.setDate(fr.getDate());
        dto.setNotes(fr.getNotes());
        dto.setType(fr.getType());
        return dto;
    }

    public List<FinancialRecordResponse> toDtoList(List<FinancialRecord> list) {
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }
}
