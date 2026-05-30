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
    public ResponseEntity<List<AmbienteResponseDTO>> listarDisponiveis(@RequestParam(required = false, defaultValue = "true") boolean apenasAtivos) {
        return ResponseEntity.ok(service.listarTodos(apenasAtivos));
    }

    @PostMapping
    public ResponseEntity<AmbienteResponseDTO> cadastrarEspaco(@RequestBody @Valid AmbienteRequestDTO data) {
        return ResponseEntity.ok(service.cadastrarEspaco(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmbienteResponseDTO> atualizarFichaTecnica(@PathVariable String id, @RequestBody @Valid AmbienteRequestDTO data) {
        return ResponseEntity.ok(service.atualizarFichaTecnica(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerEspaco(@PathVariable String id) {
        service.removerEspaco(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarEspaco(@PathVariable String id) {
        service.ativarEspaco(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/ficha")
    public ResponseEntity<Void> apagarFichaTecnica(@PathVariable String id) {
        service.apagarFichaTecnica(id);
        return ResponseEntity.noContent().build();
    }
}
