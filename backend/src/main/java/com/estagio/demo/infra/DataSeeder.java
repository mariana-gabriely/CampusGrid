package com.estagio.demo.infra;

import com.estagio.demo.domain.user.User;
import com.estagio.demo.domain.user.UserRole;
import com.estagio.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User(
                "Administrador CampusGrid",
                "admin@unifil.br",
                passwordEncoder.encode("admin123"),
                UserRole.APROVADOR
            );
            userRepository.save(admin);
            System.out.println(">>> Usuário administrador criado: admin@unifil.br / admin123");
        }
    }
}
