package com.upwise.backend.service;

import com.upwise.backend.model.Role;
import com.upwise.backend.model.User;
import com.upwise.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user, List<String> roleNames) {
        // encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        for (String rn : roleNames) {
            Role r = roleService.createIfNotExists(rn);
            user.addRole(r);
        }
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) { return userRepository.findById(id); }

    public List<User> listAll() { return userRepository.findAll(); }

    @Transactional
    public User updateStatus(Long userId, boolean active) {
        User u = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        u.setActive(active);
        return u;
    }
}
