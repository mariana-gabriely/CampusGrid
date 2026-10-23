package com.estagio.demo.controllers;

import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.auth.AuthenticationDTO;
import com.estagio.demo.dto.auth.LoginResponseDTO;
import com.estagio.demo.repositories.UsuarioRepository;
import com.estagio.demo.services.TokenService;
import com.estagio.demo.services.EmailService;
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

import java.security.SecureRandom;

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
    @Autowired
    private EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var user = (Usuario) auth.getPrincipal();
        var token = tokenService.generateToken(user);

        return ResponseEntity.ok(new LoginResponseDTO(token, user.getIdUsuario(), user.getNome(), user.getEmail(), user.getPerfil(),
                user.getCurso(), user.getCampus().getIdCampus(), user.getCampus().getNome()));
    }

    @PostMapping("/recovery")
    public ResponseEntity recovery(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        var userOpt = repository.findByEmail(email);
        if (userOpt == null) return ResponseEntity.ok(java.util.Map.of(
            "message", "Se o e-mail estiver cadastrado, as instruções serão enviadas"
        ));
        var user = (Usuario) userOpt;
        String tempPass = "UniFil@" + (SECURE_RANDOM.nextInt(9000) + 1000);
        emailService.enviarRecuperacaoSenha(user.getEmail(), tempPass);
        user.setSenha(passwordEncoder.encode(tempPass));
        repository.save(user);

        return ResponseEntity.ok(java.util.Map.of(
            "message", "Se o e-mail estiver cadastrado, as instruções serão enviadas"
        ));
    }
}
