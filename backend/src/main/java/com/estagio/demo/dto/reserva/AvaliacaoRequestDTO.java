package com.estagio.demo.dto.reserva;

import jakarta.validation.constraints.NotBlank;

public record AvaliacaoRequestDTO(
    String motivoRecusa  // obrigatório só na recusa, validado no service
) {}
