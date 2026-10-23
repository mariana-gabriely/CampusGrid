package com.estagio.demo.services;

import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.reserva.Permuta;
import com.estagio.demo.domain.reserva.Reserva;
import com.estagio.demo.domain.reserva.ReservaStatus;
import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.domain.user.UserRole;
import com.estagio.demo.dto.reserva.*;
import com.estagio.demo.repositories.PermutaRepository;
import com.estagio.demo.repositories.ReservaRepository;
import com.estagio.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PermutaService {

    @Autowired
    private PermutaRepository permutaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired private EmailService emailService;
    @Autowired private UsuarioRepository usuarioRepository;

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Transactional
    public PermutaResponseDTO proporPermuta(PermutaRequestDTO data) {
        Usuario logado = getUsuarioLogado();

        Reserva solicitante = reservaRepository.findById(data.idReservaSolicitante())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva solicitante não encontrada"));

        Reserva destinatario = reservaRepository.findById(data.idReservaDestinatario())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva destinatária não encontrada"));

        if (!solicitante.getAmbiente().getCampus().equals(logado.getCampus())
                || !destinatario.getAmbiente().getCampus().equals(logado.getCampus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permutas só podem ocorrer dentro do mesmo campus");
        }

        if (!solicitante.getSolicitante().getIdUsuario().equals(logado.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você só pode propor permuta a partir de uma reserva sua");
        }

        if (destinatario.getSolicitante().getIdUsuario().equals(logado.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode propor permuta com uma reserva que já é sua");
        }

        if (solicitante.getStatus() != ReservaStatus.APROVADO || destinatario.getStatus() != ReservaStatus.APROVADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas reservas aprovadas/efetivadas podem ser permutadas");
        }

        Permuta permuta = new Permuta(solicitante, destinatario);
        permutaRepository.save(permuta);

        auditoriaService.gravarLog(
                logado,
                "PERMUTA_PROPOSTA",
                solicitante,
                "Proposta de permuta com a reserva " + destinatario.getIdReserva() + " de " + destinatario.getSolicitante().getNome()
        );
        emailService.enviarNotificacao(destinatario.getSolicitante().getEmail(),
                "Nova proposta de troca - CampusGrid",
                logado.getNome() + " enviou uma proposta de troca de reservas.");

        return new PermutaResponseDTO(permuta);
    }

    @Transactional
    public PermutaResponseDTO responderPermuta(String idPermuta, ResponderPermutaDTO data) {
        Usuario logado = getUsuarioLogado();
        Permuta permuta = permutaRepository.findById(idPermuta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permuta não encontrada"));

        if (!permuta.getReservaSolicitante().getAmbiente().getCampus().equals(logado.getCampus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permuta pertence a outro campus");
        }

        if (!permuta.getReservaDestinatario().getSolicitante().getIdUsuario().equals(logado.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o destinatário da permuta pode respondê-la");
        }

        if (!"PENDENTE_ACEITE".equals(permuta.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta permuta já foi respondida");
        }

        if (data.aceitar()) {
            permuta.setStatus("PENDENTE_GESTOR");
            auditoriaService.gravarLog(
                    logado,
                    "PERMUTA_ACEITA_DESTINATARIO",
                    permuta.getReservaDestinatario(),
                    "Permuta aceita pelo destinatário. Enviada para avaliação do Gestor."
            );
            usuarioRepository.findByCampusAndPerfilAndAtivoTrueOrderByNome(
                    logado.getCampus(), UserRole.APROVADOR).forEach(gestor ->
                    emailService.enviarNotificacao(gestor.getEmail(),
                            "Troca aguardando decisão - CampusGrid",
                            "Uma troca aceita pelos docentes aguarda sua decisão."));
        } else {
            if (data.motivoRecusa() == null || data.motivoRecusa().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivo da recusa é obrigatório");
            }
            permuta.setStatus("RECUSADA_DESTINATARIO");
            permuta.setMotivoRecusa(data.motivoRecusa());
            auditoriaService.gravarLog(
                    logado,
                    "PERMUTA_RECUSADA_DESTINATARIO",
                    permuta.getReservaDestinatario(),
                    "Permuta recusada pelo destinatário. Motivo: " + data.motivoRecusa()
            );
            emailService.enviarNotificacao(permuta.getUsuarioSolicitante().getEmail(),
                    "Proposta de troca recusada - CampusGrid",
                    "A proposta foi recusada. Motivo: " + data.motivoRecusa());
        }

        permutaRepository.save(permuta);
        return new PermutaResponseDTO(permuta);
    }

    @Transactional
    public PermutaResponseDTO avaliarGestor(String idPermuta, AvaliarPermutaDTO data) {
        Usuario logado = getUsuarioLogado();
        if (logado.getPerfil() != UserRole.APROVADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas gestores podem homologar permutas");
        }

        Permuta permuta = permutaRepository.findById(idPermuta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permuta não encontrada"));

        if (!permuta.getReservaSolicitante().getAmbiente().getCampus().equals(logado.getCampus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permuta pertence a outro campus");
        }

        if (!"PENDENTE_GESTOR".equals(permuta.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta permuta não está pendente de avaliação do gestor");
        }

        if (data.aprovar()) {
            Reserva resS = permuta.getReservaSolicitante();
            Reserva resD = permuta.getReservaDestinatario();

            Ambiente roomS = resS.getAmbiente();
            Ambiente roomD = resD.getAmbiente();

            // Validar conflitos cruzados
            reservaService.validarConflitoHorario(roomD.getIdAmbiente(), resS.getDataInicio(), resS.getDataFim(), resD.getIdReserva());
            reservaService.validarConflitoHorario(roomS.getIdAmbiente(), resD.getDataInicio(), resD.getDataFim(), resS.getIdReserva());

            // Executar a troca de solicitantes
            Usuario userS = resS.getSolicitante();
            Usuario userD = resD.getSolicitante();

            resS.setSolicitante(userD);
            resD.setSolicitante(userS);

            reservaRepository.save(resS);
            reservaRepository.save(resD);

            permuta.setStatus("APROVADA_GESTOR");

            auditoriaService.gravarLog(
                    logado,
                    "PERMUTA_APROVADA_GESTOR",
                    resS,
                    "Permuta aprovada pelo gestor. Proprietário alterado de " + userS.getNome() + " para " + userD.getNome()
            );

            auditoriaService.gravarLog(
                    logado,
                    "PERMUTA_APROVADA_GESTOR",
                    resD,
                    "Permuta aprovada pelo gestor. Proprietário alterado de " + userD.getNome() + " para " + userS.getNome()
            );
        } else {
            if (data.motivoRecusa() == null || data.motivoRecusa().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivo da recusa é obrigatório");
            }
            permuta.setStatus("RECUSADA_GESTOR");
            permuta.setMotivoRecusa(data.motivoRecusa());

            auditoriaService.gravarLog(
                    logado,
                    "PERMUTA_RECUSADA_GESTOR",
                    permuta.getReservaSolicitante(),
                    "Permuta recusada pelo gestor. Motivo: " + data.motivoRecusa()
            );
        }

        permutaRepository.save(permuta);
        String resultado = "APROVADA_GESTOR".equals(permuta.getStatus()) ? "aprovada" : "recusada";
        emailService.enviarNotificacao(permuta.getUsuarioSolicitante().getEmail(),
                "Resultado da troca - CampusGrid", "A troca foi " + resultado + " pelo gestor.");
        emailService.enviarNotificacao(permuta.getUsuarioDestinatario().getEmail(),
                "Resultado da troca - CampusGrid", "A troca foi " + resultado + " pelo gestor.");
        return new PermutaResponseDTO(permuta);
    }

    @Transactional
    public PermutaResponseDTO cancelarPermuta(String idPermuta) {
        Usuario logado = getUsuarioLogado();
        Permuta permuta = permutaRepository.findById(idPermuta)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permuta não encontrada"));

        if (!permuta.getUsuarioSolicitante().getIdUsuario().equals(logado.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o docente proponente pode cancelar a permuta");
        }

        if (!"PENDENTE_ACEITE".equals(permuta.getStatus()) && !"PENDENTE_GESTOR".equals(permuta.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta permuta não pode mais ser cancelada");
        }

        permuta.setStatus("CANCELADA");
        permutaRepository.save(permuta);

        auditoriaService.gravarLog(
                logado,
                "PERMUTA_CANCELADA",
                permuta.getReservaSolicitante(),
                "Proposta de permuta cancelada pelo proponente."
        );

        return new PermutaResponseDTO(permuta);
    }

    @Transactional(readOnly = true)
    public List<PermutaResponseDTO> listarRecebidas() {
        Usuario logado = getUsuarioLogado();
        return permutaRepository.findByUsuarioDestinatarioIdUsuario(logado.getIdUsuario())
                .stream().map(PermutaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PermutaResponseDTO> listarEnviadas() {
        Usuario logado = getUsuarioLogado();
        return permutaRepository.findByUsuarioSolicitanteIdUsuario(logado.getIdUsuario())
                .stream().map(PermutaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PermutaResponseDTO> listarPendentesGestor() {
        Usuario logado = getUsuarioLogado();
        return permutaRepository.findByStatus("PENDENTE_GESTOR")
                .stream().filter(p -> p.getReservaSolicitante().getAmbiente().getCampus().equals(logado.getCampus()))
                .map(PermutaResponseDTO::new).collect(Collectors.toList());
    }
}
