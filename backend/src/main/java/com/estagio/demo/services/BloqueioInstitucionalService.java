package com.estagio.demo.services;

import com.estagio.demo.domain.bloqueio.BloqueioInstitucional;
import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.bloqueio.*;
import com.estagio.demo.repositories.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BloqueioInstitucionalService {
    private final BloqueioInstitucionalRepository repository;
    private final AmbienteRepository ambienteRepository;
    private final AuditoriaService auditoriaService;

    public BloqueioInstitucionalService(BloqueioInstitucionalRepository repository,
            AmbienteRepository ambienteRepository, AuditoriaService auditoriaService) {
        this.repository = repository; this.ambienteRepository = ambienteRepository;
        this.auditoriaService = auditoriaService;
    }

    private Usuario usuario() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Transactional(readOnly = true)
    public List<BloqueioResponseDTO> listar() {
        return repository.findByCampusAndAtivoTrueOrderByDataInicio(usuario().getCampus()).stream()
                .map(BloqueioResponseDTO::new).toList();
    }

    @Transactional
    public BloqueioResponseDTO criar(BloqueioRequestDTO dto) {
        Usuario gestor = usuario();
        if (!dto.dataFim().isAfter(dto.dataInicio()) || dto.dataInicio().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um período futuro válido");
        }
        Ambiente ambiente = null;
        if (dto.idAmbiente() != null && !dto.idAmbiente().isBlank()) {
            ambiente = ambienteRepository.findById(dto.idAmbiente())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ambiente não encontrado"));
            if (!ambiente.getCampus().equals(gestor.getCampus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ambiente pertence a outro campus");
            }
        }
        var bloqueio = repository.save(new BloqueioInstitucional(
                gestor.getCampus(), ambiente, gestor, dto.dataInicio(), dto.dataFim(), dto.motivo()));
        auditoriaService.gravarLog(gestor, "BLOQUEIO_INSTITUCIONAL_CRIADO", null, bloqueio.getMotivo(),
                "Período bloqueado de " + dto.dataInicio() + " até " + dto.dataFim());
        return new BloqueioResponseDTO(bloqueio);
    }

    @Transactional
    public void cancelar(String id) {
        Usuario gestor = usuario();
        var bloqueio = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloqueio não encontrado"));
        if (!bloqueio.getCampus().equals(gestor.getCampus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bloqueio pertence a outro campus");
        }
        bloqueio.setAtivo(false);
        repository.save(bloqueio);
        auditoriaService.gravarLog(gestor, "BLOQUEIO_INSTITUCIONAL_CANCELADO", "ATIVO", "CANCELADO",
                "Bloqueio cancelado: " + bloqueio.getMotivo());
    }
}
