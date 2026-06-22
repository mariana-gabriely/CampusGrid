package com.estagio.demo.controllers;

import com.estagio.demo.dto.environment.AmbienteRequestDTO;
import com.estagio.demo.dto.environment.AmbienteResponseDTO;
import com.estagio.demo.services.AmbienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/environments")
public class AmbienteController {

    @Autowired
    private AmbienteService service;

    @GetMapping
    public ResponseEntity<List<AmbienteResponseDTO>> listarAmbientes(@RequestParam(required = false, defaultValue = "true") boolean apenasAtivos) {
        return ResponseEntity.ok(service.listarTodos(apenasAtivos));
    }

    @PostMapping
    public ResponseEntity<AmbienteResponseDTO> cadastrarAmbiente(@RequestBody @Valid AmbienteRequestDTO data) {
        return ResponseEntity.ok(service.cadastrarAmbiente(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmbienteResponseDTO> atualizarAmbiente(@PathVariable String id, @RequestBody @Valid AmbienteRequestDTO data) {
        return ResponseEntity.ok(service.atualizarAmbiente(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativarAmbiente(@PathVariable String id) {
        service.desativarAmbiente(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarAmbiente(@PathVariable String id) {
        service.ativarAmbiente(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/ficha")
    public ResponseEntity<Void> apagarFichaTecnica(@PathVariable String id) {
        service.apagarFichaTecnica(id);
        return ResponseEntity.noContent().build();
    }
}
