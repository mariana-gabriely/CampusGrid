package com.estagio.demo.services;

import com.estagio.demo.domain.auditoria.LogAuditoria;
import com.estagio.demo.domain.reserva.Reserva;
import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.auditoria.LogAuditoriaResponseDTO;
import com.estagio.demo.repositories.LogAuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ControladorAuditoria — conforme Diagrama de Classes.
 * Responsável por: gravarLog() e consultarHistorico().
 */
@Service
public class AuditoriaService {

    @Autowired
    private LogAuditoriaRepository repository;

    @Transactional
    public void gravarLog(Usuario usuario, String acao, Reserva reserva,
                          String valorAntigo, String valorNovo, String detalhes) {
        LogAuditoria log = new LogAuditoria(acao, usuario, reserva, valorAntigo, valorNovo, detalhes);
        repository.save(log);
    }

    /** Sobrecarga de conveniência para logs sem valor antigo/novo */
    @Transactional
    public void gravarLog(Usuario usuario, String acao, Reserva reserva, String detalhes) {
        gravarLog(usuario, acao, reserva, null, null, detalhes);
    }

    /** Sobrecarga para logs não relacionados a reservas (ex: CRUD de usuários/ambientes) */
    @Transactional
    public void gravarLog(Usuario usuario, String acao, String valorAntigo, String valorNovo, String detalhes) {
        gravarLog(usuario, acao, null, valorAntigo, valorNovo, detalhes);
    }

    @Transactional(readOnly = true)
    public List<LogAuditoriaResponseDTO> consultarHistorico() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(LogAuditoriaResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LogAuditoriaResponseDTO> consultarPorUsuario(String idUsuario) {
        return repository.findByUsuarioIdUsuarioOrderByCreatedAtDesc(idUsuario)
                .stream()
                .map(LogAuditoriaResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LogAuditoriaResponseDTO> consultarPorReserva(String idReserva) {
        return repository.findByReservaIdReservaOrderByCreatedAtDesc(idReserva)
                .stream()
                .map(LogAuditoriaResponseDTO::new)
                .collect(Collectors.toList());
    }
}
