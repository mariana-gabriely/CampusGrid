package com.estagio.demo.repositories;

import com.estagio.demo.domain.environment.Ambiente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmbienteRepository extends JpaRepository<Ambiente, String> {
    List<Ambiente> findAllByAtivoTrue();
}
