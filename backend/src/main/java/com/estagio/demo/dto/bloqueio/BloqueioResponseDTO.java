package com.estagio.demo.dto.bloqueio;

import com.estagio.demo.domain.bloqueio.BloqueioInstitucional;
import java.time.LocalDateTime;

public record BloqueioResponseDTO(String idBloqueio, String idCampus, String nomeCampus,
        String idAmbiente, String nomeAmbiente, LocalDateTime dataInicio, LocalDateTime dataFim,
        String motivo, boolean ativo, String nomeCriador) {
    public BloqueioResponseDTO(BloqueioInstitucional b) {
        this(b.getIdBloqueio(), b.getCampus().getIdCampus(), b.getCampus().getNome(),
                b.getAmbiente() == null ? null : b.getAmbiente().getIdAmbiente(),
                b.getAmbiente() == null ? "Todo o campus" : b.getAmbiente().getNomeSala(),
                b.getDataInicio(), b.getDataFim(), b.getMotivo(), b.isAtivo(), b.getCriador().getNome());
    }
}
