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

        return ResponseEntity.ok(new LoginResponseDTO(token, user.getIdUsuario(), user.getNome(), user.getEmail(), user.getPerfil(), user.getCurso()));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid UsuarioRequestDTO data) {
        if (this.repository.findByEmail(data.email()) != null) return ResponseEntity.badRequest().build();

        String encryptedPassword = passwordEncoder.encode(data.senha());
        Usuario newUser = new Usuario(data.nome(), data.email(), encryptedPassword, data.perfil(), data.curso());

        this.repository.save(newUser);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/recovery")
    public ResponseEntity recovery(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        var userOpt = repository.findByEmail(email);
        if (userOpt == null) {
            return ResponseEntity.status(404).body("E-mail não cadastrado");
        }
        var user = (Usuario) userOpt;
        String tempPass = "UniFil@" + (int)(Math.random() * 9000 + 1000);
        user.setSenha(passwordEncoder.encode(tempPass));
        repository.save(user);

        System.out.println("=== RECOVERY EMAIL SIMULATION ===");
        System.out.println("To: " + email);
        System.out.println("Subject: Recuperação de Senha - CampusGrid");
        System.out.println("Sua senha temporária de acesso é: " + tempPass);
        System.out.println("==================================");

        return ResponseEntity.ok(java.util.Map.of(
            "message", "E-mail de recuperação enviado com sucesso", 
            "tempPassword", tempPass
        ));
    }
}
