package com.upwise.backend.service;

import com.upwise.backend.dto.BudgetDTO;
import com.upwise.backend.exception.ResourceNotFoundException;
import com.upwise.backend.model.Budget;
import com.upwise.backend.model.FinancialRecord;
import com.upwise.backend.model.User;
import com.upwise.backend.repository.BudgetRepository;
import com.upwise.backend.repository.FinancialRecordRepository;
import com.upwise.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final FinancialRecordRepository recordRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, FinancialRecordRepository recordRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Budget createOrUpdateBudget(BudgetDTO dto) {
        User user = userRepository.findById(dto.getUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Budget b = budgetRepository.findByUserAndCategory(user, dto.getCategory()).orElse(new Budget());
        b.setCategory(dto.getCategory());
        b.setLimitAmount(dto.getLimitAmount());
        b.setUser(user);
        return budgetRepository.save(b);
    }

    public Map<String, Object> getBudgetStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Budget> budgets = budgetRepository.findByUser(user);
        Map<String, Object> res = new HashMap<>();
        for (Budget b : budgets) {
            BigDecimal used = calculateUsedAmount(b.getCategory());
            BigDecimal remaining = b.getLimitAmount() == null ? BigDecimal.ZERO : b.getLimitAmount().subtract(used);
            String status = "SAFE";
            if (b.getLimitAmount() != null && b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal usedPercent = used.divide(b.getLimitAmount(), 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal(100));
                if (usedPercent.compareTo(new BigDecimal(100)) > 0) status = "EXCEEDED";
                else if (usedPercent.compareTo(new BigDecimal(80)) >= 0) status = "NEAR_LIMIT";
            }
            Map<String, Object> item = new HashMap<>();
            item.put("category", b.getCategory());
            item.put("limit", b.getLimitAmount());
            item.put("used", used);
            item.put("remaining", remaining);
            item.put("status", status);
            res.put(b.getCategory(), item);
        }
        return res;
    }

    private BigDecimal calculateUsedAmount(String category) {
        List<FinancialRecord> list = recordRepository.findByCategoryAndDeletedFalse(category);
        BigDecimal sum = BigDecimal.ZERO;
        for (FinancialRecord fr : list) {
            if (fr.getType() == FinancialRecord.RecordType.EXPENSE && fr.getAmount() != null) sum = sum.add(fr.getAmount());
        }
        return sum;
    }
}

