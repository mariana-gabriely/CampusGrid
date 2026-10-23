package com.estagio.demo.dto.campus;

import com.estagio.demo.domain.campus.Campus;

public record CampusResponseDTO(String idCampus, String nome, boolean ativo) {
    public CampusResponseDTO(Campus campus) {
        this(campus.getIdCampus(), campus.getNome(), campus.isAtivo());
    }
}
