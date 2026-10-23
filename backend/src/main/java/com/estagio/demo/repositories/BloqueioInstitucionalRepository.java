package com.estagio.demo.repositories;

import com.estagio.demo.domain.bloqueio.BloqueioInstitucional;
import com.estagio.demo.domain.campus.Campus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface BloqueioInstitucionalRepository extends JpaRepository<BloqueioInstitucional, String> {
    List<BloqueioInstitucional> findByCampusAndAtivoTrueOrderByDataInicio(Campus campus);

    @Query("""
        SELECT COUNT(b) > 0 FROM BloqueioInstitucional b
        WHERE b.ativo = true AND b.campus = :campus
          AND (b.ambiente IS NULL OR b.ambiente.idAmbiente = :idAmbiente)
          AND b.dataInicio < :fim AND b.dataFim > :inicio
    """)
    boolean existeBloqueio(@Param("campus") Campus campus, @Param("idAmbiente") String idAmbiente,
                            @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
