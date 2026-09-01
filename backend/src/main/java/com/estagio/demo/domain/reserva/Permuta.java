package com.estagio.demo.domain.reserva;

import com.estagio.demo.domain.user.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "permutas")
@Entity(name = "Permuta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idPermuta")
public class Permuta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_permuta")
    private String idPermuta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva_solicitante", nullable = false)
    private Reserva reservaSolicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva_destinatario", nullable = false)
    private Reserva reservaDestinatario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_solicitante", nullable = false)
    private Usuario usuarioSolicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_destinatario", nullable = false)
    private Usuario usuarioDestinatario;

    @Column(nullable = false)
    private String status = "PENDENTE_ACEITE"; // PENDENTE_ACEITE, RECUSADA_DESTINATARIO, PENDENTE_GESTOR, APROVADA_GESTOR, RECUSADA_GESTOR

    @Column(name = "motivo_recusa")
    private String motivoRecusa;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Permuta(Reserva reservaSolicitante, Reserva reservaDestinatario) {
        this.reservaSolicitante = reservaSolicitante;
        this.reservaDestinatario = reservaDestinatario;
        this.usuarioSolicitante = reservaSolicitante.getSolicitante();
        this.usuarioDestinatario = reservaDestinatario.getSolicitante();
        this.status = "PENDENTE_ACEITE";
        this.createdAt = LocalDateTime.now();
    }
}
