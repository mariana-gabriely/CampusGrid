package com.estagio.demo.repositories;

import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.campus.Campus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AmbienteRepository extends JpaRepository<Ambiente, String> {
    List<Ambiente> findByCampusAndAtivoTrueOrderByNomeSala(Campus campus);
    List<Ambiente> findByCampusOrderByNomeSala(Campus campus);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Ambiente a WHERE a.idAmbiente = :id")
    Optional<Ambiente> findByIdForUpdate(@Param("id") String id);
}
