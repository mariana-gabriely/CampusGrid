package com.estagio.demo.domain.campus;

import jakarta.persistence.*;
import lombok.*;

@Entity(name = "Campus")
@Table(name = "campi")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(of = "idCampus")
public class Campus {
    @Id
    @Column(name = "id_campus", length = 40)
    private String idCampus;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(nullable = false)
    private boolean ativo = true;
}
