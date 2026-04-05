package com.upwise.backend.dto;

public class ApiResponse<T> {
    private String status; // success or error
    private String message;
    private T data;

    public ApiResponse() {}

    public ApiResponse(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>("success", null, data); }
    public static <T> ApiResponse<T> error(String message) { return new ApiResponse<>("error", message, null); }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}

