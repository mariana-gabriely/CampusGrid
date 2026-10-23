package com.estagio.demo.repositories;

import com.estagio.demo.domain.campus.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampusRepository extends JpaRepository<Campus, String> {
    List<Campus> findByAtivoTrueOrderByNome();
}
