package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequestDTO(
    @NotBlank String nome,
    @NotBlank @Email String email,
    @NotBlank String senha,
    @NotNull UserRole perfil
) {}
