package com.upwise.backend.bootstrap;

import com.upwise.backend.model.Budget;
import com.upwise.backend.model.FinancialRecord;
import com.upwise.backend.model.FinancialRecord.RecordType;
import com.upwise.backend.model.User;
import com.upwise.backend.repository.BudgetRepository;
import com.upwise.backend.repository.FinancialRecordRepository;
import com.upwise.backend.service.AuditService;
import com.upwise.backend.service.RoleService;
import com.upwise.backend.service.UserService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer {
    private final RoleService roleService;
    private final UserService userService;
    private final FinancialRecordRepository recordRepository;
    private final BudgetRepository budgetRepository;
    private final AuditService auditService;

    public DataInitializer(RoleService roleService, UserService userService, FinancialRecordRepository recordRepository, BudgetRepository budgetRepository, AuditService auditService) {
        this.roleService = roleService;
        this.userService = userService;
        this.recordRepository = recordRepository;
        this.budgetRepository = budgetRepository;
        this.auditService = auditService;
    }

    @PostConstruct
    public void init() {
        seedDemo();
    }

    // Public method so admin endpoint can re-run seeding at runtime
    public void seedDemo() {
        roleService.createIfNotExists("ROLE_ADMIN");
        roleService.createIfNotExists("ROLE_ANALYST");
        roleService.createIfNotExists("ROLE_VIEWER");

        // create a default admin if not exists
        if (userService.findByUsername("admin").isEmpty()) {
            User admin = new User("admin", "adminpass");
            admin.setEmail("admin@example.com");
            userService.createUser(admin, List.of("ROLE_ADMIN"));
        }

        // Seed three test users for the assignment
        if (userService.findByUsername("admin1").isEmpty()) {
            User u = new User("admin1", "admin123");
            u.setEmail("admin1@example.com");
            userService.createUser(u, List.of("ROLE_ADMIN"));
        }

        if (userService.findByUsername("analyst1").isEmpty()) {
            User u = new User("analyst1", "analyst123");
            u.setEmail("analyst1@example.com");
            userService.createUser(u, List.of("ROLE_ANALYST"));
        }

        if (userService.findByUsername("viewer1").isEmpty()) {
            User u = new User("viewer1", "viewer123");
            u.setEmail("viewer1@example.com");
            userService.createUser(u, List.of("ROLE_VIEWER"));
        }

        // Seed financial records if none exist
        try {
            if (recordRepository.count() == 0) {
                List<FinancialRecord> demo = new ArrayList<>();
                // Income across months
                demo.add(new FinancialRecord(new BigDecimal("5000"), RecordType.INCOME, "Salary", LocalDate.of(2026, 1, 25)));
                demo.add(new FinancialRecord(new BigDecimal("5200"), RecordType.INCOME, "Salary", LocalDate.of(2026, 2, 25)));
                demo.add(new FinancialRecord(new BigDecimal("5100"), RecordType.INCOME, "Salary", LocalDate.of(2026, 3, 25)));
                demo.add(new FinancialRecord(new BigDecimal("600"), RecordType.INCOME, "Freelance", LocalDate.of(2026, 2, 10)));

                // Expenses across categories and months
                demo.add(new FinancialRecord(new BigDecimal("1200"), RecordType.EXPENSE, "Rent", LocalDate.of(2026, 1, 1)));
                demo.add(new FinancialRecord(new BigDecimal("1250"), RecordType.EXPENSE, "Rent", LocalDate.of(2026, 2, 1)));
                demo.add(new FinancialRecord(new BigDecimal("1250"), RecordType.EXPENSE, "Rent", LocalDate.of(2026, 3, 1)));

                demo.add(new FinancialRecord(new BigDecimal("320"), RecordType.EXPENSE, "Groceries", LocalDate.of(2026, 1, 5)));
                demo.add(new FinancialRecord(new BigDecimal("450"), RecordType.EXPENSE, "Groceries", LocalDate.of(2026, 2, 12)));
                demo.add(new FinancialRecord(new BigDecimal("380"), RecordType.EXPENSE, "Groceries", LocalDate.of(2026, 3, 8)));

                demo.add(new FinancialRecord(new BigDecimal("60"), RecordType.EXPENSE, "Transport", LocalDate.of(2026, 1, 10)));
                demo.add(new FinancialRecord(new BigDecimal("75"), RecordType.EXPENSE, "Transport", LocalDate.of(2026, 2, 11)));
                demo.add(new FinancialRecord(new BigDecimal("80"), RecordType.EXPENSE, "Transport", LocalDate.of(2026, 3, 14)));

                demo.add(new FinancialRecord(new BigDecimal("120"), RecordType.EXPENSE, "Dining", LocalDate.of(2026, 1, 20)));
                demo.add(new FinancialRecord(new BigDecimal("200"), RecordType.EXPENSE, "Dining", LocalDate.of(2026, 2, 18)));
                demo.add(new FinancialRecord(new BigDecimal("150"), RecordType.EXPENSE, "Dining", LocalDate.of(2026, 3, 21)));

                demo.forEach(fr -> fr.setNotes("Demo data"));
                recordRepository.saveAll(demo);
            }
        } catch (Exception ex) {
            // ignore seeding failures
        }

        // Seed budgets for admin1 if none exist
        try {
            Optional<User> admin1 = userService.findByUsername("admin1");
            if (admin1.isPresent()) {
                User a = admin1.get();
                if (budgetRepository.findByUserAndCategory(a, "Groceries").isEmpty()) {
                    Budget b = new Budget();
                    b.setCategory("Groceries");
                    b.setLimitAmount(new BigDecimal("500"));
                    b.setUser(a);
                    budgetRepository.save(b);
                }

                if (budgetRepository.findByUserAndCategory(a, "Dining").isEmpty()) {
                    Budget b = new Budget();
                    b.setCategory("Dining");
                    b.setLimitAmount(new BigDecimal("200"));
                    b.setUser(a);
                    budgetRepository.save(b);
                }

                if (budgetRepository.findByUserAndCategory(a, "Rent").isEmpty()) {
                    Budget b = new Budget();
                    b.setCategory("Rent");
                    b.setLimitAmount(new BigDecimal("1300"));
                    b.setUser(a);
                    budgetRepository.save(b);
                }
            }
        } catch (Exception ex) {
            // ignore
        }

        // Seed a few audit logs for exploration
        try {
            auditService.log("admin1", "BOOTSTRAP_SEED");
            auditService.log("admin1", "LOGIN");
            auditService.log("analyst1", "BOOTSTRAP_SEED");
        } catch (Exception ignore) {}
    }
}
