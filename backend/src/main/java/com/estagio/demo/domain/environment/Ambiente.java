package com.estagio.demo.domain.environment;

import com.estagio.demo.domain.campus.Campus;
import jakarta.persistence.*;
import lombok.*;
import com.estagio.demo.domain.user.Usuario;
import java.util.LinkedHashSet;
import java.util.Set;

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

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_campus", nullable = false)
    private Campus campus;

    @Column(name = "exige_preparacao_tecnica", nullable = false)
    private boolean exigePreparacaoTecnica;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "ambiente_tecnicos",
            joinColumns = @JoinColumn(name = "id_ambiente"),
            inverseJoinColumns = @JoinColumn(name = "id_usuario"))
    private Set<Usuario> tecnicosResponsaveis = new LinkedHashSet<>();

    public Ambiente(String nomeSala, Integer capacidade, String categoria, String exclusivoCurso, Campus campus) {
        this.nomeSala = nomeSala;
        this.capacidade = capacidade;
        this.categoria = categoria;
        this.exclusivoCurso = exclusivoCurso;
        this.status = true;
        this.ativo = true;
        this.campus = campus;
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
