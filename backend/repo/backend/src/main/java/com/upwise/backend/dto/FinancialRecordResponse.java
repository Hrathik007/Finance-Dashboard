package com.upwise.backend.dto;

import com.upwise.backend.model.FinancialRecord.RecordType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FinancialRecordResponse {
    private Long id;
    private BigDecimal amount;
    private RecordType type;
    private String category;
    private String notes;
    private LocalDate date;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public RecordType getType() { return type; }
    public void setType(RecordType type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}

