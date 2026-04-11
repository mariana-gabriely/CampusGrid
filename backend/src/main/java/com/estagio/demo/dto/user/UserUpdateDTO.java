package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.UserRole;
import jakarta.validation.constraints.Email;

public record UserUpdateDTO(
    String name,
    @Email String email,
    String password,
    UserRole role
) {}
