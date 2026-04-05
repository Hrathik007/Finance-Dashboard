package com.upwise.backend.repository;

import com.upwise.backend.model.FinancialRecord;
import com.upwise.backend.model.FinancialRecord.RecordType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long>, JpaSpecificationExecutor<FinancialRecord> {
    List<FinancialRecord> findByDeletedFalse();
    List<FinancialRecord> findByTypeAndDeletedFalse(RecordType type);
    List<FinancialRecord> findByCategoryAndDeletedFalse(String category);
    List<FinancialRecord> findByDateBetweenAndDeletedFalse(LocalDate start, LocalDate end);

    @Query("SELECT SUM(fr.amount) FROM FinancialRecord fr WHERE fr.type = :type AND fr.deleted = false")
    java.math.BigDecimal sumAmountByType(@Param("type") RecordType type);

    @Query("SELECT fr.category, SUM(fr.amount) FROM FinancialRecord fr WHERE fr.deleted = false GROUP BY fr.category")
    List<Object[]> sumAmountGroupedByCategory();

    // New: monthly trends using native query (groups by month number)
    @Query(value = "SELECT EXTRACT(MONTH FROM date) AS month, " +
            "SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS income, " +
            "SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expense " +
            "FROM financial_records WHERE deleted = false GROUP BY EXTRACT(MONTH FROM date) ORDER BY month",
            nativeQuery = true)
    List<Object[]> monthlyTrends();

    // New: top expense categories (ordered desc)
    @Query(value = "SELECT fr.category, SUM(fr.amount) as total FROM financial_records fr WHERE fr.deleted = false AND fr.type = 'EXPENSE' GROUP BY fr.category ORDER BY total DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> topExpenseCategories(@Param("limit") int limit);

    // New: recent transactions (use pageable to limit)
    @Query("SELECT fr FROM FinancialRecord fr WHERE fr.deleted = false ORDER BY fr.date DESC")
    List<FinancialRecord> findRecentTransactions(Pageable pageable);
}
