package com.estagio.demo.domain.auditoria;

import com.estagio.demo.domain.reserva.Reserva;
import com.estagio.demo.domain.user.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "logs_auditoria")
@Entity(name = "LogAuditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idLog")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_log")
    private String idLog;

    @Column(nullable = false)
    private String acao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva")
    private Reserva reserva;

    @Column(name = "valor_antigo")
    private String valorAntigo;

    @Column(name = "valor_novo")
    private String valorNovo;

    private String detalhes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public LogAuditoria(String acao, Usuario usuario, Reserva reserva,
                        String valorAntigo, String valorNovo, String detalhes) {
        this.acao = acao;
        this.usuario = usuario;
        this.reserva = reserva;
        this.valorAntigo = valorAntigo;
        this.valorNovo = valorNovo;
        this.detalhes = detalhes;
        this.createdAt = LocalDateTime.now();
    }

    /** Construtor de conveniência para logs sem valor antigo/novo (ex: reservas novas) */
    public LogAuditoria(String acao, Usuario usuario, Reserva reserva, String detalhes) {
        this(acao, usuario, reserva, null, null, detalhes);
    }
}
