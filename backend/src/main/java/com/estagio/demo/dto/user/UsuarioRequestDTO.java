package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UsuarioRequestDTO(
    @NotBlank String nome,
    @NotBlank @Email @Pattern(regexp = "^.+\\.br$", message = "O e-mail deve terminar com .br") String email,
    @NotBlank String senha,
    @NotNull UserRole perfil
) {}
