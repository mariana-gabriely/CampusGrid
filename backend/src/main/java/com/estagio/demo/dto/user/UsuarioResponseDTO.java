package com.estagio.demo.dto.user;

import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.domain.user.UserRole;

public record UsuarioResponseDTO(
    String idUsuario,
    String nome,
    String email,
    UserRole perfil,
    boolean ativo
) {
    public UsuarioResponseDTO(Usuario user) {
        this(user.getIdUsuario(), user.getNome(), user.getEmail(), user.getPerfil(), user.isAtivo());
    }
}
