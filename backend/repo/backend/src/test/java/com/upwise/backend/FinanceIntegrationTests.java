package com.upwise.backend;

import com.upwise.backend.dto.FinancialRecordDTO;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(OrderAnnotation.class)
@SpringBootTest
@AutoConfigureMockMvc
public class FinanceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    private String extractJsonField(String json, String fieldPath) {
        // naive extraction for a top-level or nested single field like $.data.token
        String key = "\"token\"";
        int idx = json.indexOf(key);
        if (idx == -1) return null;
        int colon = json.indexOf(':', idx);
        if (colon == -1) return null;
        int quote1 = json.indexOf('"', colon + 1);
        if (quote1 == -1) return null;
        int quote2 = json.indexOf('"', quote1 + 1);
        if (quote2 == -1) return null;
        return json.substring(quote1 + 1, quote2);
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        String reqJson = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        MvcResult r = mockMvc.perform(post("/api/auth/login")
                .header("Content-Type", "application/json")
                .content(reqJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.token").exists())
                .andReturn();
        String body = r.getResponse().getContentAsString();
        String token = extractJsonField(body, "$.data.token");
        return token;
    }

    private String toJsonUser(String username, String password, String email, String role) {
        return String.format("{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"roles\":[\"%s\"]}",
                username, password, email, role);
    }

    private String toJsonRecord(FinancialRecordDTO fr) {
        String notesPart = fr.getNotes() != null ? String.format(",\"notes\":\"%s\"", fr.getNotes()) : "";
        String idPart = fr.getId() != null ? String.format(",\"id\":%d", fr.getId()) : "";
        return String.format("{\"amount\":%s,\"type\":\"%s\",\"category\":\"%s\",\"date\":\"%s\"%s%s}",
                fr.getAmount().toString(), fr.getType().name(), fr.getCategory(), fr.getDate().toString(), notesPart, idPart);
    }

    private void createUserWithRoles(String adminToken, String username, String password, String role) throws Exception {
        String json = toJsonUser(username, password, username + "@example.com", role);

        mockMvc.perform(post("/api/users")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + adminToken)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    @Order(1)
    public void loginReturnsToken() throws Exception {
        String reqJson = "{\"username\":\"admin\",\"password\":\"adminpass\"}";
        mockMvc.perform(post("/api/auth/login")
                .header("Content-Type", "application/json")
                .content(reqJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.token").exists());
    }

    @Test
    @Order(2)
    public void unauthorizedWithoutTokenShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/records"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @Order(3)
    public void invalidTokenShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/records").header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("invalid_token"));
    }

    @Test
    @Order(4)
    public void adminCreateAndListRecords() throws Exception {
        String token = loginAndGetToken("admin", "adminpass");

        FinancialRecordDTO fr = new FinancialRecordDTO();
        fr.setAmount(java.math.BigDecimal.valueOf(100.5));
        fr.setType(com.upwise.backend.model.FinancialRecord.RecordType.INCOME);
        fr.setCategory("Salary");
        fr.setDate(LocalDate.now());
        fr.setNotes("Test salary");

        // create
        mockMvc.perform(post("/api/records")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .content(toJsonRecord(fr)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.id").exists());

        // list
        mockMvc.perform(get("/api/records?page=0&size=10")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @Order(5)
    public void viewerForbiddenForWriteOperations() throws Exception {
        String adminToken = loginAndGetToken("admin", "adminpass");
        String viewer = "viewer2";
        createUserWithRoles(adminToken, viewer, "viewerpass", "ROLE_VIEWER");
        String viewerToken = loginAndGetToken(viewer, "viewerpass");

        FinancialRecordDTO fr = new FinancialRecordDTO();
        fr.setAmount(java.math.BigDecimal.valueOf(20));
        fr.setType(com.upwise.backend.model.FinancialRecord.RecordType.EXPENSE);
        fr.setCategory("Food");
        fr.setDate(LocalDate.now());

        // create should be forbidden
        mockMvc.perform(post("/api/records")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + viewerToken)
                .content(toJsonRecord(fr)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value("error"));

        // update should be forbidden
        fr.setId(999L);
        mockMvc.perform(put("/api/records")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + viewerToken)
                .content(toJsonRecord(fr)))
                .andExpect(status().isForbidden());

        // delete should be forbidden
        mockMvc.perform(delete("/api/records/1").header("Authorization", "Bearer " + viewerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    public void validationErrorAndEmptyFilterResults() throws Exception {
        String token = loginAndGetToken("admin", "adminpass");

        FinancialRecordDTO fr = new FinancialRecordDTO();
        fr.setAmount(java.math.BigDecimal.valueOf(-5)); // invalid
        fr.setType(com.upwise.backend.model.FinancialRecord.RecordType.INCOME);
        fr.setCategory("Test");
        fr.setDate(LocalDate.now());

        mockMvc.perform(post("/api/records")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .content(toJsonRecord(fr)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("validation_failed"))
                .andExpect(jsonPath("$.data.amount").exists());

        // filter with future range should return empty content
        mockMvc.perform(get("/api/records/filter?start=2099-01-01&end=2099-01-02&page=0&size=10")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(0));
    }
}
