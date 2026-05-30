package com.estagio.demo.controllers;

import com.estagio.demo.dto.user.UsuarioRequestDTO;
import com.estagio.demo.dto.user.UsuarioResponseDTO;
import com.estagio.demo.dto.user.UsuarioUpdateDTO;
import com.estagio.demo.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UsuarioController {
    @Autowired
    private UsuarioService service;

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> registrarFuncionario(@RequestBody @Valid UsuarioRequestDTO data) {
        UsuarioResponseDTO response = this.service.registrarFuncionario(data);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        List<UsuarioResponseDTO> users = this.service.listarTodos();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarDados(@PathVariable String id, @RequestBody @Valid UsuarioUpdateDTO data) {
        UsuarioResponseDTO response = this.service.atualizarDados(id, data);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revogarAcesso(@PathVariable String id) {
        this.service.revogarAcesso(id);
        return ResponseEntity.noContent().build();
    }
}
