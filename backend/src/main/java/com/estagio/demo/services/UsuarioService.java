package com.estagio.demo.services;

import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.user.UsuarioRequestDTO;
import com.estagio.demo.dto.user.UsuarioResponseDTO;
import com.estagio.demo.dto.user.UsuarioUpdateDTO;
import com.estagio.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponseDTO registrarFuncionario(UsuarioRequestDTO data) {
        if (this.repository.findByEmail(data.email()) != null) {
            throw new RuntimeException("email já cadastrado");
        }

        String encryptedPassword = passwordEncoder.encode(data.senha());
        Usuario newUser = new Usuario(data.nome(), data.email(), encryptedPassword, data.perfil());
        
        this.repository.save(newUser);
        return new UsuarioResponseDTO(newUser);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return this.repository.findAll().stream()
                .filter(Usuario::isAtivo)
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponseDTO atualizarDados(String id, UsuarioUpdateDTO data) {
        Usuario user = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("usuário não encontrado"));

        if (data.nome() != null) user.setNome(data.nome());
        if (data.email() != null) {
            var userWithEmail = this.repository.findByEmail(data.email());
            if (userWithEmail != null && !((Usuario) userWithEmail).getId().equals(id)) {
                throw new RuntimeException("email já em uso");
            }
            user.setEmail(data.email());
        }
        if (data.senha() != null && !data.senha().isBlank()) {
            user.setSenha(passwordEncoder.encode(data.senha()));
        }
        if (data.perfil() != null) user.setPerfil(data.perfil());
        if (data.ativo() != null) user.setAtivo(data.ativo());

        this.repository.save(user);
        return new UsuarioResponseDTO(user);
    }

    @Transactional
    public void revogarAcesso(String id) {
        Usuario user = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("usuário não encontrado"));
        user.setAtivo(false);
        this.repository.save(user);
    }
}
