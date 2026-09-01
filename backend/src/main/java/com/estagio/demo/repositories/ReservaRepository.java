package com.estagio.demo.repositories;

import com.estagio.demo.domain.reserva.Reserva;
import com.estagio.demo.domain.reserva.ReservaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, String> {

    List<Reserva> findBySolicitanteIdUsuarioOrderByCreatedAtDesc(String idSolicitante);

    List<Reserva> findByStatusOrderByCreatedAtDesc(ReservaStatus status);

    List<Reserva> findAllByOrderByCreatedAtDesc();

    /**
     * Bloqueia se já existir reserva APROVADA ou PENDENTE_CANCELAMENTO no mesmo ambiente e período.
     * Pendentes normais no mesmo horário são permitidas (o aprovador decide).
     */
    @Query("""
        SELECT COUNT(r) > 0 FROM Reserva r
        WHERE r.ambiente.idAmbiente = :idAmbiente
          AND (r.status = 'APROVADO' OR r.status = 'PENDENTE_CANCELAMENTO')
          AND r.dataInicio < :dataFim
          AND r.dataFim > :dataInicio
          AND (:idReserva IS NULL OR r.idReserva <> :idReserva)
    """)
    boolean existeConflito(
        @Param("idAmbiente") String idAmbiente,
        @Param("dataInicio") LocalDateTime dataInicio,
        @Param("dataFim") LocalDateTime dataFim,
        @Param("idReserva") String idReserva
    );

    /**
     * Reservas aprovadas ou com cancelamento pendente em um período — usadas no mapa de ocupação do dashboard.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE (r.status = 'APROVADO' OR r.status = 'PENDENTE_CANCELAMENTO')
          AND r.dataFim >= :inicio
          AND r.dataInicio <= :fim
        ORDER BY r.dataInicio ASC
    """)
    List<Reserva> findAprovadasNoPeriodo(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );

    /**
     * Busca todas as solicitações pendentes de aprovação inicial ou pendentes de cancelamento.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.status = 'PENDENTE' OR r.status = 'PENDENTE_CANCELAMENTO'
        ORDER BY r.createdAt DESC
    """)
    List<Reserva> findPendentesGerais();
}
