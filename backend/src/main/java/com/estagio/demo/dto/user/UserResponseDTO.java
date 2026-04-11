package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.User;
import com.estagio.demo.domain.user.UserRole;

public record UserResponseDTO(String id, String name, String email, UserRole role) {
    public UserResponseDTO(User user) {
        this(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
