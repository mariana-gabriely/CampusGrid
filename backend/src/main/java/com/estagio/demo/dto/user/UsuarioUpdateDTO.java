package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.UserRole;

public record UsuarioUpdateDTO(
    String nome,
    String email,
    String senha,
    UserRole perfil,
    Boolean ativo
) {}
