package com.estagio.demo.controllers;

import com.estagio.demo.dto.bloqueio.*;
import com.estagio.demo.services.BloqueioInstitucionalService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/institutional-blocks")
public class BloqueioInstitucionalController {
    private final BloqueioInstitucionalService service;
    public BloqueioInstitucionalController(BloqueioInstitucionalService service) { this.service = service; }

    @GetMapping public ResponseEntity<List<BloqueioResponseDTO>> listar() { return ResponseEntity.ok(service.listar()); }
    @PostMapping public ResponseEntity<BloqueioResponseDTO> criar(@RequestBody @Valid BloqueioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> cancelar(@PathVariable String id) {
        service.cancelar(id); return ResponseEntity.noContent().build();
    }
}
