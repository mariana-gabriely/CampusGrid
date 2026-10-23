package com.estagio.demo.domain.bloqueio;

import com.estagio.demo.domain.campus.Campus;
import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.user.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity(name = "BloqueioInstitucional")
@Table(name = "bloqueios_institucionais")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "idBloqueio")
public class BloqueioInstitucional {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_bloqueio")
    private String idBloqueio;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_campus", nullable = false)
    private Campus campus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_ambiente")
    private Ambiente ambiente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_criador", nullable = false)
    private Usuario criador;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;
    @Column(name = "data_fim", nullable = false)
    private LocalDateTime dataFim;
    @Column(nullable = false)
    private String motivo;
    @Column(nullable = false)
    private boolean ativo = true;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public BloqueioInstitucional(Campus campus, Ambiente ambiente, Usuario criador,
                                 LocalDateTime inicio, LocalDateTime fim, String motivo) {
        this.campus = campus; this.ambiente = ambiente; this.criador = criador;
        this.dataInicio = inicio; this.dataFim = fim; this.motivo = motivo;
        this.ativo = true; this.createdAt = LocalDateTime.now();
    }
}
