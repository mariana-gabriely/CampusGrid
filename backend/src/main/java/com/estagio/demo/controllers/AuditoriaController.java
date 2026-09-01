package com.estagio.demo.controllers;

import com.estagio.demo.dto.auditoria.LogAuditoriaResponseDTO;
import com.estagio.demo.services.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit-log")
public class AuditoriaController {

    @Autowired
    private AuditoriaService service;

    /** Lista todo o histórico de auditoria (apenas APROVADOR) */
    @GetMapping
    public ResponseEntity<List<LogAuditoriaResponseDTO>> listarHistorico() {
        return ResponseEntity.ok(service.consultarHistorico());
    }

    /** Filtra logs por usuário */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<LogAuditoriaResponseDTO>> porUsuario(@PathVariable String idUsuario) {
        return ResponseEntity.ok(service.consultarPorUsuario(idUsuario));
    }

    /** Filtra logs por reserva */
    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<List<LogAuditoriaResponseDTO>> porReserva(@PathVariable String idReserva) {
        return ResponseEntity.ok(service.consultarPorReserva(idReserva));
    }
}
