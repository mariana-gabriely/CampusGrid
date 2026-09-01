package com.estagio.demo.controllers;

import com.estagio.demo.dto.reserva.*;
import com.estagio.demo.services.PermutaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permutas")
public class PermutaController {

    @Autowired
    private PermutaService permutaService;

    @PostMapping
    public ResponseEntity<PermutaResponseDTO> propor(@RequestBody @Valid PermutaRequestDTO data) {
        var response = permutaService.proporPermuta(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/responder")
    public ResponseEntity<PermutaResponseDTO> responder(
            @PathVariable String id,
            @RequestBody @Valid ResponderPermutaDTO data
    ) {
        var response = permutaService.responderPermuta(id, data);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/avaliar-gestor")
    public ResponseEntity<PermutaResponseDTO> avaliarGestor(
            @PathVariable String id,
            @RequestBody @Valid AvaliarPermutaDTO data
    ) {
        var response = permutaService.avaliarGestor(id, data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recebidas")
    public ResponseEntity<List<PermutaResponseDTO>> listarRecebidas() {
        var response = permutaService.listarRecebidas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/enviadas")
    public ResponseEntity<List<PermutaResponseDTO>> listarEnviadas() {
        var response = permutaService.listarEnviadas();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pendentes-gestor")
    public ResponseEntity<List<PermutaResponseDTO>> listarPendentesGestor() {
        var response = permutaService.listarPendentesGestor();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PermutaResponseDTO> cancelar(@PathVariable String id) {
        var response = permutaService.cancelarPermuta(id);
        return ResponseEntity.ok(response);
    }
}
