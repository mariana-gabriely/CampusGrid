package com.estagio.demo.dto.auditoria;

import com.estagio.demo.domain.auditoria.LogAuditoria;

import java.time.LocalDateTime;

public record LogAuditoriaResponseDTO(
    String idLog,
    String acao,
    String idUsuario,
    String nomeUsuario,
    String idReserva,
    String nomeAmbiente,
    String valorAntigo,
    String valorNovo,
    String detalhes,
    LocalDateTime createdAt
) {
    public LogAuditoriaResponseDTO(LogAuditoria log) {
        this(
            log.getIdLog(),
            log.getAcao(),
            log.getUsuario().getIdUsuario(),
            log.getUsuario().getNome(),
            log.getReserva() != null ? log.getReserva().getIdReserva() : null,
            log.getReserva() != null ? log.getReserva().getAmbiente().getNomeSala() : null,
            log.getValorAntigo(),
            log.getValorNovo(),
            log.getDetalhes(),
            log.getCreatedAt()
        );
    }
}
