package com.upwise.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class UserDTO {
    private Long id;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private String email;
    private boolean active = true;
    private List<String> roles;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
