package com.estagio.demo.dto.reserva;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReservaRequestDTO(
    @NotBlank(message = "ID do ambiente é obrigatório")
    String idAmbiente,

    @NotNull(message = "Data de início é obrigatória")
    @Future(message = "A data de início deve ser no futuro")
    LocalDateTime dataInicio,

    @NotNull(message = "Data de fim é obrigatória")
    LocalDateTime dataFim,

    String observacoes,
    Integer publicoEsperado,
    java.util.List<String> recursosRequisitados
) {}
