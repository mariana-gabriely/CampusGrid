package com.estagio.demo.services;

import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.environment.FichaTecnica;
import com.estagio.demo.dto.environment.AmbienteRequestDTO;
import com.estagio.demo.dto.environment.AmbienteResponseDTO;
import com.estagio.demo.repositories.AmbienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbienteService {

    @Autowired
    private AmbienteRepository repository;

    @Transactional(readOnly = true)
    public List<AmbienteResponseDTO> listarTodos(boolean apenasAtivos) {
        if (apenasAtivos) {
            return repository.findAllByAtivoTrue().stream()
                    .map(AmbienteResponseDTO::new)
                    .collect(Collectors.toList());
        }
        return repository.findAll().stream()
                .map(AmbienteResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public AmbienteResponseDTO cadastrarEspaco(AmbienteRequestDTO data) {
        Ambiente newEnvironment = new Ambiente(
                data.nomeSala(),
                data.capacidade(),
                data.categoria(),
                data.exclusivoCurso()
        );

        if ((data.observacoes() != null && !data.observacoes().isBlank()) || 
            (data.recursos() != null && !data.recursos().isEmpty())) {
            
            FichaTecnica ficha = new FichaTecnica(newEnvironment, data.observacoes(), data.recursos());
            newEnvironment.setFichaTecnica(ficha);
        }

        repository.save(newEnvironment);
        return new AmbienteResponseDTO(newEnvironment);
    }

    @Transactional
    public AmbienteResponseDTO atualizarFichaTecnica(String id, AmbienteRequestDTO data) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));

        environment.setNomeSala(data.nomeSala());
        environment.setCapacidade(data.capacidade());
        environment.setCategoria(data.categoria());
        environment.setExclusivoCurso(data.exclusivoCurso());

        FichaTecnica ficha = environment.getFichaTecnica();
        
        if ((data.observacoes() != null && !data.observacoes().isBlank()) || 
            (data.recursos() != null && !data.recursos().isEmpty())) {
            
            if (ficha == null) {
                ficha = new FichaTecnica();
                environment.setFichaTecnica(ficha);
            }
            ficha.setObservacoes(data.observacoes());
            ficha.setRecursos(data.recursos());
        } else {
            environment.setFichaTecnica(null);
        }

        repository.save(environment);
        return new AmbienteResponseDTO(environment);
    }

    @Transactional
    public void removerEspaco(String id) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        environment.setAtivo(false);
        repository.save(environment);
    }

    @Transactional
    public void ativarEspaco(String id) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        environment.setAtivo(true);
        repository.save(environment);
    }

    @Transactional
    public void apagarFichaTecnica(String id) {
        Ambiente environment = repository.findById(id).orElseThrow(() -> new RuntimeException("Ambiente não encontrado"));
        environment.setFichaTecnica(null);
        repository.save(environment);
    }
}
