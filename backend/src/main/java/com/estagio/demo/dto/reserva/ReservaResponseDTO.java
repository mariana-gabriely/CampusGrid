package com.estagio.demo.dto.reserva;

import com.estagio.demo.domain.reserva.Reserva;
import com.estagio.demo.domain.reserva.ReservaStatus;

import java.time.LocalDateTime;

public record ReservaResponseDTO(
    String idReserva,
    String idAmbiente,
    String nomeAmbiente,
    String categoriaAmbiente,
    String idSolicitante,
    String nomeSolicitante,
    LocalDateTime dataInicio,
    LocalDateTime dataFim,
    ReservaStatus status,
    String observacoes,
    String idAprovador,
    String nomeAprovador,
    LocalDateTime dataAvaliacao,
    String motivoRecusa,
    String anexoNome,
    Integer publicoEsperado,
    LocalDateTime createdAt
) {
    public ReservaResponseDTO(Reserva r) {
        this(
            r.getIdReserva(),
            r.getAmbiente().getIdAmbiente(),
            r.getAmbiente().getNomeSala(),
            r.getAmbiente().getCategoria(),
            r.getSolicitante().getIdUsuario(),
            r.getSolicitante().getNome(),
            r.getDataInicio(),
            r.getDataFim(),
            r.getStatus(),
            r.getObservacoes(),
            r.getAprovador() != null ? r.getAprovador().getIdUsuario() : null,
            r.getAprovador() != null ? r.getAprovador().getNome() : null,
            r.getDataAvaliacao(),
            r.getMotivoRecusa(),
            r.getAnexoNome(),
            r.getPublicoEsperado(),
            r.getCreatedAt()
        );
    }
}
