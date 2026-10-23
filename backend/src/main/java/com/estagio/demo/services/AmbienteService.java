package com.estagio.demo.services;

import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.environment.FichaTecnica;
import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.environment.AmbienteRequestDTO;
import com.estagio.demo.dto.environment.AmbienteResponseDTO;
import com.estagio.demo.repositories.AmbienteRepository;
import com.estagio.demo.repositories.UsuarioRepository;
import com.estagio.demo.repositories.ReservaRepository;
import com.estagio.demo.domain.user.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbienteService {

    @Autowired
    private AmbienteRepository repository;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    private Usuario getUsuarioLogado() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario u) return u;
        return null;
    }

    @Transactional(readOnly = true)
    public List<AmbienteResponseDTO> listarTodos(boolean apenasAtivos) {
        Usuario usuario = getUsuarioLogado();
        if (apenasAtivos) {
            return repository.findByCampusAndAtivoTrueOrderByNomeSala(usuario.getCampus()).stream()
                    .map(AmbienteResponseDTO::new)
                    .collect(Collectors.toList());
        }
        return repository.findByCampusOrderByNomeSala(usuario.getCampus()).stream()
                .map(AmbienteResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public AmbienteResponseDTO cadastrarAmbiente(AmbienteRequestDTO data) {
        Ambiente newEnvironment = new Ambiente(
                data.nomeSala(),
                data.capacidade(),
                data.categoria(),
                data.exclusivoCurso(),
                getUsuarioLogado().getCampus()
        );

        if ((data.observacoes() != null && !data.observacoes().isBlank()) ||
            (data.recursos() != null && !data.recursos().isEmpty())) {
            FichaTecnica ficha = new FichaTecnica(newEnvironment, data.observacoes(), data.recursos());
            newEnvironment.setFichaTecnica(ficha);
        }

        aplicarResponsaveisTecnicos(newEnvironment, data);

        repository.save(newEnvironment);
        auditoriaService.gravarLog(getUsuarioLogado(), "AMBIENTE_CRIADO", null,
                newEnvironment.getNomeSala(), "Ambiente criado no campus " + newEnvironment.getCampus().getNome());
        return new AmbienteResponseDTO(newEnvironment);
    }

    @Transactional
    public AmbienteResponseDTO atualizarAmbiente(String id, AmbienteRequestDTO data) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        validarMesmoCampus(environment);

        String valorAntigo = environment.getNomeSala() + " | Cap: " + environment.getCapacidade();

        environment.setNomeSala(data.nomeSala());
        environment.setCapacidade(data.capacidade());
        environment.setCategoria(data.categoria());
        environment.setExclusivoCurso(data.exclusivoCurso());
        aplicarResponsaveisTecnicos(environment, data);

        FichaTecnica ficha = environment.getFichaTecnica();

        if ((data.observacoes() != null && !data.observacoes().isBlank()) ||
            (data.recursos() != null && !data.recursos().isEmpty())) {
            if (ficha == null) {
                ficha = new FichaTecnica();
                environment.setFichaTecnica(ficha);
            }
            ficha.setObservacoes(data.observacoes());
            ficha.setRecursos(data.recursos());
        } else {
            environment.setFichaTecnica(null);
        }

        repository.save(environment);
        String valorNovo = environment.getNomeSala() + " | Cap: " + environment.getCapacidade();
        auditoriaService.gravarLog(getUsuarioLogado(), "AMBIENTE_ATUALIZADO", valorAntigo, valorNovo,
                "Dados do ambiente atualizados");
        return new AmbienteResponseDTO(environment);
    }

    @Transactional
    public void desativarAmbiente(String id) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        validarMesmoCampus(environment);
        if (reservaRepository.existeReservaFutura(id, java.time.LocalDateTime.now())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "O ambiente possui reservas futuras e não pode ser desativado");
        }
        environment.setAtivo(false);
        repository.save(environment);
        auditoriaService.gravarLog(getUsuarioLogado(), "AMBIENTE_DESATIVADO", "ATIVO", "INATIVO",
                "Ambiente desativado: " + environment.getNomeSala());
    }

    @Transactional
    public void ativarAmbiente(String id) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        validarMesmoCampus(environment);
        environment.setAtivo(true);
        repository.save(environment);
        auditoriaService.gravarLog(getUsuarioLogado(), "AMBIENTE_ATIVADO", "INATIVO", "ATIVO",
                "Ambiente ativado: " + environment.getNomeSala());
    }

    @Transactional
    public void apagarFichaTecnica(String id) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        validarMesmoCampus(environment);
        environment.setFichaTecnica(null);
        repository.save(environment);
    }

    private void validarMesmoCampus(Ambiente ambiente) {
        Usuario usuario = getUsuarioLogado();
        if (usuario == null || !ambiente.getCampus().equals(usuario.getCampus())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Ambiente pertence a outro campus");
        }
    }

    private void aplicarResponsaveisTecnicos(Ambiente ambiente, AmbienteRequestDTO data) {
        boolean exige = Boolean.TRUE.equals(data.exigePreparacaoTecnica());
        ambiente.setExigePreparacaoTecnica(exige);
        ambiente.getTecnicosResponsaveis().clear();
        if (!exige) return;
        String categoriaNormalizada = java.text.Normalizer.normalize(data.categoria(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toUpperCase();
        if (!"LABORATORIO".equals(categoriaNormalizada)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A preparação técnica só pode ser exigida para laboratórios");
        }
        if (data.idsTecnicosResponsaveis() == null || data.idsTecnicosResponsaveis().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Selecione ao menos um técnico responsável");
        }
        for (String id : data.idsTecnicosResponsaveis()) {
            Usuario tecnico = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("técnico não encontrado"));
            if (tecnico.getPerfil() != UserRole.TECNICO || !tecnico.isAtivo()
                    || !tecnico.getCampus().equals(getUsuarioLogado().getCampus())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Técnico inválido ou pertencente a outro campus");
            }
            ambiente.getTecnicosResponsaveis().add(tecnico);
        }
    }
}
