package com.estagio.demo.dto.bloqueio;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record BloqueioRequestDTO(String idAmbiente, @NotNull LocalDateTime dataInicio,
                                  @NotNull LocalDateTime dataFim, @NotBlank String motivo) {}
