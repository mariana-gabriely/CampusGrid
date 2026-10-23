package com.estagio.demo.controllers;

import com.estagio.demo.dto.campus.CampusResponseDTO;
import com.estagio.demo.repositories.CampusRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/campuses")
public class CampusController {
    private final CampusRepository repository;

    public CampusController(CampusRepository repository) { this.repository = repository; }

    @GetMapping
    public ResponseEntity<List<CampusResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(repository.findByAtivoTrueOrderByNome().stream()
                .map(CampusResponseDTO::new).toList());
    }
}
