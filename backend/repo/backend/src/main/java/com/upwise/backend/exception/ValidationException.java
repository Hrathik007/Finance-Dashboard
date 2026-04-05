package com.upwise.backend.exception;

import java.util.Map;

public class ValidationException extends RuntimeException {
    private final Map<String, String> errors;
    public ValidationException(Map<String, String> errors) {
        super("validation_failed");
        this.errors = errors;
    }
    public Map<String, String> getErrors() { return errors; }
}

