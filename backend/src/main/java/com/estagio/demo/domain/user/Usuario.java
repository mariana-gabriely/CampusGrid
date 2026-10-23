package com.estagio.demo.domain.user;

import com.estagio.demo.domain.campus.Campus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Table(name = "usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idUsuario")
public class Usuario implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_usuario")
    private String idUsuario;

    private String nome;

    @Column(unique = true)
    private String email;

    private String senha;

    @Enumerated(EnumType.STRING)
    private UserRole perfil;

    private boolean ativo;

    private String curso;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_campus", nullable = false)
    private Campus campus;

    public Usuario(String nome, String email, String senha, UserRole perfil) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.ativo = true;
    }

    public Usuario(String nome, String email, String senha, UserRole perfil, String curso, Campus campus) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.ativo = true;
        this.curso = curso;
        this.campus = campus;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.perfil == UserRole.APROVADOR) {
            return List.of(new SimpleGrantedAuthority("ROLE_APROVADOR"), new SimpleGrantedAuthority("ROLE_SOLICITANTE"));
        } else if (this.perfil == UserRole.TECNICO) {
            return List.of(new SimpleGrantedAuthority("ROLE_TECNICO"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_SOLICITANTE"));
        }
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getId() {
        return idUsuario;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}
