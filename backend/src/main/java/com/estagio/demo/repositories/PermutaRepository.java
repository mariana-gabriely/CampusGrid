package com.estagio.demo.repositories;

import com.estagio.demo.domain.reserva.Permuta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermutaRepository extends JpaRepository<Permuta, String> {
    List<Permuta> findByUsuarioDestinatarioIdUsuario(String idUsuario);
    List<Permuta> findByUsuarioSolicitanteIdUsuario(String idUsuario);
    List<Permuta> findByStatus(String status);
}
