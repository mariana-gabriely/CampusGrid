package com.estagio.demo.domain.environment;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "ambientes")
@Entity(name = "Ambiente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "idAmbiente")
public class Ambiente {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_ambiente")
    private String idAmbiente;

    @Column(name = "nome_sala")
    private String nomeSala;

    private Integer capacidade;

    private String categoria;

    @Column(name = "exclusivo_curso")
    private String exclusivoCurso;

    @OneToOne(mappedBy = "ambiente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private FichaTecnica fichaTecnica;

    private boolean status;

    private boolean ativo;

    public Ambiente(String nomeSala, Integer capacidade, String categoria, String exclusivoCurso) {
        this.nomeSala = nomeSala;
        this.capacidade = capacidade;
        this.categoria = categoria;
        this.exclusivoCurso = exclusivoCurso;
        this.status = true;
        this.ativo = true;
    }

    public void setFichaTecnica(FichaTecnica ficha) {
        if (ficha == null) {
            if (this.fichaTecnica != null) {
                this.fichaTecnica.setAmbiente(null);
            }
        } else {
            ficha.setAmbiente(this);
        }
        this.fichaTecnica = ficha;
    }
}
