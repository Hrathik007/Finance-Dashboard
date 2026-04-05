package com.upwise.backend.service;

import com.upwise.backend.dto.FinancialRecordResponse;
import com.upwise.backend.model.FinancialRecord;
import com.upwise.backend.model.User;
import com.upwise.backend.repository.FinancialRecordRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private final FinancialRecordRepository recordRepository;

    public AnalyticsService(FinancialRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    public Map<String, Object> getOverallSummary(User user) {
        BigDecimal income = recordRepository.sumAmountByType(FinancialRecord.RecordType.INCOME);
        BigDecimal expense = recordRepository.sumAmountByType(FinancialRecord.RecordType.EXPENSE);
        if (income == null) income = BigDecimal.ZERO;
        if (expense == null) expense = BigDecimal.ZERO;
        BigDecimal net = income.subtract(expense);
        Map<String, Object> res = new HashMap<>();
        res.put("totalIncome", income);
        res.put("totalExpense", expense);
        res.put("net", net);
        return res;
    }

    public Map<String, BigDecimal> getCategoryBreakdown(User user) {
        List<Object[]> rows = recordRepository.sumAmountGroupedByCategory();
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            String cat = (String) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            map.put(cat, sum);
        }
        return map;
    }

    public List<Map<String, Object>> getMonthlyTrends(User user) {
        List<Object[]> rows = recordRepository.monthlyTrends();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Object[] row : rows) {
            Integer month = ((Number) row[0]).intValue();
            BigDecimal income = row[1] == null ? BigDecimal.ZERO : new BigDecimal(row[1].toString());
            BigDecimal expense = row[2] == null ? BigDecimal.ZERO : new BigDecimal(row[2].toString());
            Map<String, Object> m = new HashMap<>();
            m.put("month", month);
            m.put("income", income);
            m.put("expense", expense);
            res.add(m);
        }
        return res;
    }

    public List<Map<String, Object>> getTopCategories(int limit) {
        List<Object[]> rows = recordRepository.topExpenseCategories(limit);
        List<Map<String, Object>> res = new ArrayList<>();
        for (Object[] row : rows) {
            String cat = (String) row[0];
            BigDecimal total = row[1] == null ? BigDecimal.ZERO : new BigDecimal(row[1].toString());
            Map<String, Object> m = new HashMap<>();
            m.put("category", cat);
            m.put("total", total);
            res.add(m);
        }
        return res;
    }

    public List<FinancialRecordResponse> getRecentTransactions() {
        List<FinancialRecord> recs = recordRepository.findRecentTransactions(PageRequest.of(0, 5));
        return recs.stream().map(fr -> {
            FinancialRecordResponse dto = new FinancialRecordResponse();
            dto.setId(fr.getId());
            dto.setAmount(fr.getAmount());
            dto.setCategory(fr.getCategory());
            dto.setDate(fr.getDate());
            dto.setNotes(fr.getNotes());
            dto.setType(fr.getType());
            return dto;
        }).collect(Collectors.toList());
    }

    public double getSavingsRate(User user) {
        BigDecimal income = recordRepository.sumAmountByType(FinancialRecord.RecordType.INCOME);
        BigDecimal expense = recordRepository.sumAmountByType(FinancialRecord.RecordType.EXPENSE);
        if (income == null || income.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        if (expense == null) expense = BigDecimal.ZERO;
        BigDecimal savings = income.subtract(expense);
        double rate = savings.divide(income, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal(100)).doubleValue();
        return rate;
    }
}

