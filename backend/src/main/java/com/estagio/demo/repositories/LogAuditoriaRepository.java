package com.estagio.demo.repositories;

import com.estagio.demo.domain.auditoria.LogAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, String> {

    List<LogAuditoria> findAllByOrderByCreatedAtDesc();

    List<LogAuditoria> findByUsuarioIdUsuarioOrderByCreatedAtDesc(String idUsuario);

    List<LogAuditoria> findByReservaIdReservaOrderByCreatedAtDesc(String idReserva);
}
