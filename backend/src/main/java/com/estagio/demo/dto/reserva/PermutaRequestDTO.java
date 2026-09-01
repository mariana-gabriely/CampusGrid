package com.estagio.demo.dto.reserva;

import jakarta.validation.constraints.NotBlank;

public record PermutaRequestDTO(
    @NotBlank(message = "ID da reserva solicitante é obrigatório")
    String idReservaSolicitante,

    @NotBlank(message = "ID da reserva destinatária é obrigatório")
    String idReservaDestinatario
) {}
