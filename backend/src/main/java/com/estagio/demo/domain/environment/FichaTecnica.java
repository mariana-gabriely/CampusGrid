package com.estagio.demo.domain.environment;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Table(name = "fichas_tecnicas")
@Entity(name = "FichaTecnica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idFicha")
public class FichaTecnica {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_ficha")
    private String idFicha;

    @OneToOne
    @JoinColumn(name = "id_ambiente")
    private Ambiente ambiente;

    private String observacoes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ficha_tecnica_recursos", joinColumns = @JoinColumn(name = "id_ficha"))
    @Column(name = "descricao")
    private List<String> recursos;

    public FichaTecnica(Ambiente ambiente, String observacoes, List<String> recursos) {
        this.ambiente = ambiente;
        this.observacoes = observacoes;
        this.recursos = recursos;
    }
}
