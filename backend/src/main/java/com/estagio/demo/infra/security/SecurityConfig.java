package com.estagio.demo.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    SecurityFilter securityFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/recovery").permitAll()
                        .requestMatchers(HttpMethod.GET, "/campuses").authenticated()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api-docs/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/webjars/**").permitAll()
                        
                        // controle de acesso para usuários
                        .requestMatchers(HttpMethod.POST, "/users").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.GET, "/users").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.PUT, "/users/**").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("APROVADOR")

                        // controle de acesso para ambientes
                        .requestMatchers(HttpMethod.GET, "/environments").hasAnyRole("APROVADOR", "SOLICITANTE", "TECNICO")
                        .requestMatchers(HttpMethod.POST, "/environments").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.PUT, "/environments/**").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.DELETE, "/environments/**").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.PATCH, "/environments/**").hasRole("APROVADOR")

                        .requestMatchers(HttpMethod.GET, "/institutional-blocks").hasAnyRole("APROVADOR", "SOLICITANTE", "TECNICO")
                        .requestMatchers("/institutional-blocks/**").hasRole("APROVADOR")

                        // controle de acesso para recursos
                        .requestMatchers(HttpMethod.GET, "/resources").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.POST, "/resources").hasRole("APROVADOR")

                        // controle de acesso para reservas
                        .requestMatchers(HttpMethod.POST, "/reservas").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.GET, "/reservas/minhas").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.GET, "/reservas/ocupacao").hasAnyRole("APROVADOR", "SOLICITANTE", "TECNICO")
                        .requestMatchers(HttpMethod.DELETE, "/reservas/**").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.GET, "/reservas").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.GET, "/reservas/pendentes").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.PATCH, "/reservas/**").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.GET, "/reservas/*/anexo").hasAnyRole("APROVADOR", "SOLICITANTE")

                        // controle de acesso para permutas
                        .requestMatchers(HttpMethod.POST, "/permutas").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.PATCH, "/permutas/*/responder").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.GET, "/permutas/recebidas").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.GET, "/permutas/enviadas").hasAnyRole("APROVADOR", "SOLICITANTE")
                        .requestMatchers(HttpMethod.GET, "/permutas/pendentes-gestor").hasRole("APROVADOR")
                        .requestMatchers(HttpMethod.PATCH, "/permutas/*/avaliar-gestor").hasRole("APROVADOR")

                        // controle de acesso para auditoria
                        .requestMatchers("/audit-log/**").hasRole("APROVADOR")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
