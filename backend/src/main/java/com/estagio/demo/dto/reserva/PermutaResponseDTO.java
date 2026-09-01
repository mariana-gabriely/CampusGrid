package com.estagio.demo.dto.reserva;

import com.estagio.demo.domain.reserva.Permuta;

import java.time.LocalDateTime;

public record PermutaResponseDTO(
    String idPermuta,
    String idReservaSolicitante,
    String nomeSolicitante,
    String ambienteSolicitanteNome,
    LocalDateTime dataInicioSolicitante,
    LocalDateTime dataFimSolicitante,

    String idReservaDestinatario,
    String nomeDestinatario,
    String ambienteDestinatarioNome,
    LocalDateTime dataInicioDestinatario,
    LocalDateTime dataFimDestinatario,

    String status,
    String motivoRecusa,
    LocalDateTime createdAt
) {
    public PermutaResponseDTO(Permuta p) {
        this(
            p.getIdPermuta(),
            p.getReservaSolicitante().getIdReserva(),
            p.getUsuarioSolicitante().getNome(),
            p.getReservaSolicitante().getAmbiente().getNomeSala(),
            p.getReservaSolicitante().getDataInicio(),
            p.getReservaSolicitante().getDataFim(),

            p.getReservaDestinatario().getIdReserva(),
            p.getUsuarioDestinatario().getNome(),
            p.getReservaDestinatario().getAmbiente().getNomeSala(),
            p.getReservaDestinatario().getDataInicio(),
            p.getReservaDestinatario().getDataFim(),

            p.getStatus(),
            p.getMotivoRecusa(),
            p.getCreatedAt()
        );
    }
}
