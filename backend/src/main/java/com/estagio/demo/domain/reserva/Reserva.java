package com.estagio.demo.domain.reserva;

import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.user.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "reservas")
@Entity(name = "Reserva")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idReserva")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_reserva")
    private String idReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ambiente", nullable = false)
    private Ambiente ambiente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitante", nullable = false)
    private Usuario solicitante;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDateTime dataFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservaStatus status = ReservaStatus.PENDENTE;

    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aprovador")
    private Usuario aprovador;

    @Column(name = "data_avaliacao")
    private LocalDateTime dataAvaliacao;

    @Column(name = "motivo_recusa")
    private String motivoRecusa;

    @Column(name = "anexo_nome")
    private String anexoNome;

    @Column(name = "anexo_conteudo")
    private byte[] anexoConteudo;

    @Column(name = "publico_esperado")
    private Integer publicoEsperado;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Reserva(Ambiente ambiente, Usuario solicitante, LocalDateTime dataInicio, LocalDateTime dataFim, String observacoes) {
        this.ambiente = ambiente;
        this.solicitante = solicitante;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.observacoes = observacoes;
        this.status = ReservaStatus.PENDENTE;
        this.createdAt = LocalDateTime.now();
    }

    public Reserva(Ambiente ambiente, Usuario solicitante, LocalDateTime dataInicio, LocalDateTime dataFim, String observacoes, Integer publicoEsperado) {
        this.ambiente = ambiente;
        this.solicitante = solicitante;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.observacoes = observacoes;
        this.status = ReservaStatus.PENDENTE;
        this.publicoEsperado = publicoEsperado;
        this.createdAt = LocalDateTime.now();
    }
}
