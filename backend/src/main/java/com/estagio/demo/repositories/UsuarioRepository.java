package com.estagio.demo.repositories;

import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.domain.campus.Campus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Usuario findByEmail(String email);
    java.util.List<Usuario> findByCampusOrderByNome(Campus campus);
    java.util.List<Usuario> findByCampusAndAtivoTrueOrderByNome(Campus campus);
    java.util.List<Usuario> findByCampusAndPerfilAndAtivoTrueOrderByNome(Campus campus, com.estagio.demo.domain.user.UserRole perfil);
}
