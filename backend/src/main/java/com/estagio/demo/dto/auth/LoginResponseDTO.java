package com.estagio.demo.dto.auth;

import com.estagio.demo.domain.user.UserRole;

public record LoginResponseDTO(String token, String idUsuario, String nome, String email, UserRole perfil, String curso) {}
