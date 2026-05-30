package com.estagio.demo.controllers;

import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.auth.AuthenticationDTO;
import com.estagio.demo.dto.auth.LoginResponseDTO;
import com.estagio.demo.dto.user.UsuarioRequestDTO;
import com.estagio.demo.repositories.UsuarioRepository;
import com.estagio.demo.services.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UsuarioRepository repository;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var user = (Usuario) auth.getPrincipal();
        var token = tokenService.generateToken(user);

        return ResponseEntity.ok(new LoginResponseDTO(token, user.getNome(), user.getEmail(), user.getPerfil()));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid UsuarioRequestDTO data) {
        if (this.repository.findByEmail(data.email()) != null) return ResponseEntity.badRequest().build();

        String encryptedPassword = passwordEncoder.encode(data.senha());
        Usuario newUser = new Usuario(data.nome(), data.email(), encryptedPassword, data.perfil());

        this.repository.save(newUser);

        return ResponseEntity.ok().build();
    }
}
