package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record UsuarioUpdateDTO(
    String nome,
    @Email @Pattern(regexp = "^.+\\.br$", message = "O e-mail deve terminar com .br") String email,
    String senha,
    UserRole perfil,
    Boolean ativo
) {}
