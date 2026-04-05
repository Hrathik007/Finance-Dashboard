package com.upwise.backend.service;

import com.upwise.backend.model.Role;
import com.upwise.backend.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public Role createIfNotExists(String roleName) {
        return roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }
}

