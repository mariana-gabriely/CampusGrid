package com.estagio.demo.dto.environment;

import com.estagio.demo.domain.environment.Ambiente;

import java.util.List;

public record AmbienteResponseDTO(
    String idAmbiente,
    String nomeSala,
    Integer capacidade,
    String categoria,
    String exclusivoCurso,
    String observacoes,
    List<String> recursos,
    boolean status,
    boolean ativo
) {
    public AmbienteResponseDTO(Ambiente environment) {
        this(
            environment.getIdAmbiente(),
            environment.getNomeSala(),
            environment.getCapacidade(),
            environment.getCategoria(),
            environment.getExclusivoCurso(),
            environment.getFichaTecnica() != null ? environment.getFichaTecnica().getObservacoes() : null,
            environment.getFichaTecnica() != null ? environment.getFichaTecnica().getRecursos() : List.of(),
            environment.isStatus(),
            environment.isAtivo()
        );
    }
}
