package com.estagio.demo.dto.environment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AmbienteRequestDTO(
    @NotBlank String nomeSala,
    @NotNull Integer capacidade,
    @NotBlank String categoria,
    String exclusivoCurso,
    String observacoes,
    List<String> recursos
) {
}
