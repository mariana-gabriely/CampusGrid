package com.estagio.demo.services;

import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.user.UsuarioRequestDTO;
import com.estagio.demo.dto.user.UsuarioResponseDTO;
import com.estagio.demo.dto.user.UsuarioUpdateDTO;
import com.estagio.demo.repositories.UsuarioRepository;
import com.estagio.demo.repositories.CampusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private CampusRepository campusRepository;

    private Usuario getUsuarioLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario u) return u;
        return null;
    }

    @Transactional
    public UsuarioResponseDTO registrarFuncionario(UsuarioRequestDTO data) {
        if (this.repository.findByEmail(data.email()) != null) {
            throw new RuntimeException("email já cadastrado");
        }

        Usuario gestor = getUsuarioLogado();
        if (gestor == null || !gestor.getCampus().getIdCampus().equals(data.campus())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Só é possível cadastrar usuários no seu campus");
        }
        var campus = campusRepository.findById(data.campus())
                .filter(com.estagio.demo.domain.campus.Campus::isAtivo)
                .orElseThrow(() -> new RuntimeException("campus não encontrado ou inativo"));
        String encryptedPassword = passwordEncoder.encode(data.senha());
        Usuario newUser = new Usuario(data.nome(), data.email(), encryptedPassword, data.perfil(), data.curso(), campus);
        this.repository.save(newUser);
        auditoriaService.gravarLog(gestor, "USUARIO_CRIADO", null, newUser.getEmail(),
                "Usuário criado: " + newUser.getNome());
        return new UsuarioResponseDTO(newUser);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos(boolean apenasAtivos) {
        Usuario gestor = getUsuarioLogado();
        if (apenasAtivos) {
            return this.repository.findByCampusAndAtivoTrueOrderByNome(gestor.getCampus()).stream()
                    .map(UsuarioResponseDTO::new)
                    .collect(Collectors.toList());
        }
        return this.repository.findByCampusOrderByNome(gestor.getCampus()).stream()
                .map(UsuarioResponseDTO::new)
                .collect(Collectors.toList());
    }



    @Transactional
    public UsuarioResponseDTO atualizarDados(String id, UsuarioUpdateDTO data) {
        Usuario user = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("usuário não encontrado"));
        validarMesmoCampus(user);

        String valorAntigo = user.getNome() + " | " + user.getEmail() + " | " + user.getPerfil();

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
        if (data.curso() != null) user.setCurso(data.curso());

        this.repository.save(user);

        String valorNovo = user.getNome() + " | " + user.getEmail() + " | " + user.getPerfil();
        auditoriaService.gravarLog(getUsuarioLogado(), "USUARIO_ATUALIZADO", valorAntigo, valorNovo,
                "Cadastro do usuário " + user.getNome() + " atualizado");
        return new UsuarioResponseDTO(user);
    }

    @Transactional
    public void revogarAcesso(String id) {
        Usuario user = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("usuário não encontrado"));
        validarMesmoCampus(user);
        Usuario gestor = getUsuarioLogado();
        if (user.getIdUsuario().equals(gestor.getIdUsuario())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Você não pode desativar o próprio acesso");
        }
        user.setAtivo(false);
        this.repository.save(user);
        auditoriaService.gravarLog(gestor, "USUARIO_DESATIVADO", "ATIVO", "INATIVO",
                "Acesso de " + user.getNome() + " desativado");
    }

    private void validarMesmoCampus(Usuario usuario) {
        Usuario gestor = getUsuarioLogado();
        if (gestor == null || !usuario.getCampus().equals(gestor.getCampus())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Usuário pertence a outro campus");
        }
    }
}
