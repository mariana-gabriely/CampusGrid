package com.estagio.demo.services;

import com.estagio.demo.domain.user.User;
import com.estagio.demo.dto.user.UserRequestDTO;
import com.estagio.demo.dto.user.UserResponseDTO;
import com.estagio.demo.dto.user.UserUpdateDTO;
import com.estagio.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDTO create(UserRequestDTO data) {
        if (this.repository.findByEmail(data.email()) != null) {
            throw new RuntimeException("email já cadastrado");
        }

        String encryptedPassword = passwordEncoder.encode(data.password());
        User newUser = new User(data.name(), data.email(), encryptedPassword, data.role());
        
        this.repository.save(newUser);
        return new UserResponseDTO(newUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> findAll() {
        return this.repository.findAll().stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDTO update(String id, UserUpdateDTO data) {
        User user = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("usuário não encontrado"));

        if (data.name() != null) user.setName(data.name());
        if (data.email() != null) {
            var userWithEmail = this.repository.findByEmail(data.email());
            if (userWithEmail != null && !((User) userWithEmail).getId().equals(id)) {
                throw new RuntimeException("email já em uso");
            }
            user.setEmail(data.email());
        }
        if (data.password() != null && !data.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(data.password()));
        }
        if (data.role() != null) user.setRole(data.role());

        this.repository.save(user);
        return new UserResponseDTO(user);
    }

    @Transactional
    public void delete(String id) {
        User user = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("usuário não encontrado"));
        this.repository.delete(user);
    }
}
