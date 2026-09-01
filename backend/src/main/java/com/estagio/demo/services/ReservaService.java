package com.estagio.demo.services;

import com.estagio.demo.domain.environment.Ambiente;
import com.estagio.demo.domain.reserva.Reserva;
import com.estagio.demo.domain.reserva.ReservaStatus;
import com.estagio.demo.domain.user.Usuario;
import com.estagio.demo.dto.reserva.AvaliacaoRequestDTO;
import com.estagio.demo.dto.reserva.ReservaRequestDTO;
import com.estagio.demo.dto.reserva.ReservaResponseDTO;
import com.estagio.demo.repositories.AmbienteRepository;
import com.estagio.demo.repositories.ReservaRepository;
import com.estagio.demo.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.estagio.demo.domain.user.UserRole;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ControladorReservas — conforme Diagrama de Classes.
 * Métodos: solicitarReserva, validarConflitoHorario, aprovarReserva,
 *          recusarReserva, cancelarSolicitacao.
 */
@Service
public class ReservaService {

    @Autowired private ReservaRepository reservaRepository;
    @Autowired private AmbienteRepository ambienteRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private AuditoriaService auditoriaService;

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ─────────────────────────────────────────────
    // UC: Solicitar Reserva
    // ─────────────────────────────────────────────

    @Transactional
    public ReservaResponseDTO solicitarReserva(ReservaRequestDTO data) {
        return solicitarReserva(data, null);
    }

    @Transactional
    public ReservaResponseDTO solicitarReserva(ReservaRequestDTO data, org.springframework.web.multipart.MultipartFile file) {
        Usuario solicitante = getUsuarioLogado();

        Ambiente ambiente = ambienteRepository.findById(data.idAmbiente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ambiente não encontrado"));

        if (!ambiente.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiente inativo");
        }

        if (ambiente.getExclusivoCurso() != null && !ambiente.getExclusivoCurso().isBlank()) {
            if (solicitante.getCurso() == null || !solicitante.getCurso().equalsIgnoreCase(ambiente.getExclusivoCurso())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este ambiente é exclusivo para o curso de " + ambiente.getExclusivoCurso());
            }
        }

        validarConflitoHorario(data.idAmbiente(), data.dataInicio(), data.dataFim(), null);

        if (data.dataFim().isBefore(data.dataInicio()) || data.dataFim().isEqual(data.dataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data de fim deve ser posterior à data de início");
        }

        if (data.publicoEsperado() != null && data.publicoEsperado() > ambiente.getCapacidade()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O público esperado excede a capacidade máxima do ambiente (" + ambiente.getCapacidade() + " pessoas)");
        }

        if (("LABORATORIO".equalsIgnoreCase(ambiente.getCategoria()) || "AUDITORIO".equalsIgnoreCase(ambiente.getCategoria())) &&
            (file == null || file.isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento comprobatório obrigatório para laboratórios e auditórios");
        }

        Reserva reserva = new Reserva(ambiente, solicitante, data.dataInicio(), data.dataFim(), data.observacoes(), data.publicoEsperado());

        if (file != null && !file.isEmpty()) {
            try {
                reserva.setAnexoNome(file.getOriginalFilename());
                reserva.setAnexoConteudo(file.getBytes());
            } catch (java.io.IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao ler conteúdo do anexo", e);
            }
        }

        reservaRepository.save(reserva);

        auditoriaService.gravarLog(
                solicitante,
                "SOLICITACAO_CRIADA",
                reserva,
                "Reserva solicitada para " + ambiente.getNomeSala() +
                " de " + data.dataInicio() + " até " + data.dataFim()
        );

        return new ReservaResponseDTO(reserva);
    }

    @Transactional
    public ReservaResponseDTO atualizarReserva(String idReserva, ReservaRequestDTO data) {
        return atualizarReserva(idReserva, data, null);
    }

    @Transactional
    public ReservaResponseDTO atualizarReserva(String idReserva, ReservaRequestDTO data, org.springframework.web.multipart.MultipartFile file) {
        Usuario solicitante = getUsuarioLogado();
        Reserva reserva = buscarReservaEntidade(idReserva);

        if (!reserva.getSolicitante().getIdUsuario().equals(solicitante.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode editar esta reserva");
        }

        if (reserva.getStatus() != ReservaStatus.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas reservas pendentes de aprovação podem ser editadas");
        }

        Ambiente ambiente = ambienteRepository.findById(data.idAmbiente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ambiente não encontrado"));

        if (!ambiente.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ambiente inativo");
        }

        if (ambiente.getExclusivoCurso() != null && !ambiente.getExclusivoCurso().isBlank()) {
            if (solicitante.getCurso() == null || !solicitante.getCurso().equalsIgnoreCase(ambiente.getExclusivoCurso())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este ambiente é exclusivo para o curso de " + ambiente.getExclusivoCurso());
            }
        }

        if (data.dataFim().isBefore(data.dataInicio()) || data.dataFim().isEqual(data.dataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data de fim deve ser posterior à data de início");
        }

        if (data.publicoEsperado() != null && data.publicoEsperado() > ambiente.getCapacidade()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O público esperado excede a capacidade máxima do ambiente (" + ambiente.getCapacidade() + " pessoas)");
        }

        validarConflitoHorario(data.idAmbiente(), data.dataInicio(), data.dataFim(), idReserva);

        boolean isLabOrAuditorio = "LABORATORIO".equalsIgnoreCase(ambiente.getCategoria()) || "AUDITORIO".equalsIgnoreCase(ambiente.getCategoria());
        boolean hasExistingFile = reserva.getAnexoConteudo() != null && reserva.getAnexoConteudo().length > 0;

        if (isLabOrAuditorio && !hasExistingFile && (file == null || file.isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Documento comprobatório obrigatório para laboratórios e auditórios");
        }

        // Save old values for audit log
        String valorAntigo = "Ambiente: " + reserva.getAmbiente().getNomeSala() + ", Início: " + reserva.getDataInicio() + ", Fim: " + reserva.getDataFim();

        reserva.setAmbiente(ambiente);
        reserva.setDataInicio(data.dataInicio());
        reserva.setDataFim(data.dataFim());
        reserva.setObservacoes(data.observacoes());
        reserva.setPublicoEsperado(data.publicoEsperado());

        if (file != null && !file.isEmpty()) {
            try {
                reserva.setAnexoNome(file.getOriginalFilename());
                reserva.setAnexoConteudo(file.getBytes());
            } catch (java.io.IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao ler conteúdo do anexo", e);
            }
        }

        reservaRepository.save(reserva);

        String valorNovo = "Ambiente: " + ambiente.getNomeSala() + ", Início: " + data.dataInicio() + ", Fim: " + data.dataFim();

        auditoriaService.gravarLog(
                solicitante,
                "RESERVA_ATUALIZADA",
                reserva,
                valorAntigo,
                valorNovo,
                "Reserva atualizada pelo solicitante"
        );

        return new ReservaResponseDTO(reserva);
    }

    public Reserva buscarReservaEntidade(String idReserva) {
        return reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
    }

    // ─────────────────────────────────────────────
    // Validação de conflito (conforme regra de negócio)
    // ─────────────────────────────────────────────

    public void validarConflitoHorario(String idAmbiente, LocalDateTime inicio,
                                       LocalDateTime fim, String idReservaExcluir) {
        boolean conflito = reservaRepository.existeConflito(idAmbiente, inicio, fim, idReservaExcluir);
        if (conflito) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe uma reserva aprovada para este ambiente neste período");
        }
    }

    // ─────────────────────────────────────────────
    // UC: Aprovar Reserva
    // ─────────────────────────────────────────────

    @Transactional
    public ReservaResponseDTO aprovarReserva(String idReserva) {
        Usuario aprovador = getUsuarioLogado();
        Reserva reserva = buscarReservaEntidade(idReserva);

        if (reserva.getStatus() == ReservaStatus.PENDENTE) {
            // Verifica conflito com outras aprovadas (pode ter surgido desde a criação)
            validarConflitoHorario(
                    reserva.getAmbiente().getIdAmbiente(),
                    reserva.getDataInicio(),
                    reserva.getDataFim(),
                    idReserva
            );

            reserva.setStatus(ReservaStatus.APROVADO);
            reserva.setAprovador(aprovador);
            reserva.setDataAvaliacao(LocalDateTime.now());
            reservaRepository.save(reserva);

            auditoriaService.gravarLog(
                    aprovador,
                    "RESERVA_APROVADA",
                    reserva,
                    "PENDENTE",
                    "APROVADO",
                    "Reserva de " + reserva.getSolicitante().getNome() +
                    " aprovada para " + reserva.getAmbiente().getNomeSala()
            );
        } else if (reserva.getStatus() == ReservaStatus.PENDENTE_CANCELAMENTO) {
            reserva.setStatus(ReservaStatus.CANCELADO);
            reserva.setAprovador(aprovador);
            reserva.setDataAvaliacao(LocalDateTime.now());
            reservaRepository.save(reserva);

            auditoriaService.gravarLog(
                    aprovador,
                    "RESERVA_CANCELADA",
                    reserva,
                    "PENDENTE_CANCELAMENTO",
                    "CANCELADO",
                    "Cancelamento de reserva homologado pelo gestor para o ambiente " + reserva.getAmbiente().getNomeSala()
            );
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas reservas pendentes de aprovação ou de cancelamento podem ser aprovadas");
        }

        return new ReservaResponseDTO(reserva);
    }

    // ─────────────────────────────────────────────
    // UC: Recusar Reserva
    // ─────────────────────────────────────────────

    @Transactional
    public ReservaResponseDTO recusarReserva(String idReserva, AvaliacaoRequestDTO data) {
        if (data.motivoRecusa() == null || data.motivoRecusa().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Motivo da recusa é obrigatório");
        }

        Usuario aprovador = getUsuarioLogado();
        Reserva reserva = buscarReservaEntidade(idReserva);

        if (reserva.getStatus() == ReservaStatus.PENDENTE) {
            reserva.setStatus(ReservaStatus.RECUSADO);
            reserva.setAprovador(aprovador);
            reserva.setDataAvaliacao(LocalDateTime.now());
            reserva.setMotivoRecusa(data.motivoRecusa());
            reservaRepository.save(reserva);

            auditoriaService.gravarLog(
                    aprovador,
                    "RESERVA_RECUSADA",
                    reserva,
                    "PENDENTE",
                    "RECUSADO",
                    "Motivo: " + data.motivoRecusa()
            );
        } else if (reserva.getStatus() == ReservaStatus.PENDENTE_CANCELAMENTO) {
            reserva.setStatus(ReservaStatus.APROVADO);
            reserva.setAprovador(aprovador);
            reserva.setDataAvaliacao(LocalDateTime.now());
            reserva.setMotivoRecusa(data.motivoRecusa());
            reservaRepository.save(reserva);

            auditoriaService.gravarLog(
                    aprovador,
                    "SOLICITACAO_CANCELAMENTO_RECUSADA",
                    reserva,
                    "PENDENTE_CANCELAMENTO",
                    "APROVADO",
                    "Cancelamento de reserva recusado pelo gestor. Motivo: " + data.motivoRecusa()
            );
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas reservas pendentes de aprovação ou de cancelamento podem ser recusadas");
        }

        return new ReservaResponseDTO(reserva);
    }

    // ─────────────────────────────────────────────
    // UC: Cancelar Solicitação (pelo próprio solicitante)
    // ─────────────────────────────────────────────

    @Transactional
    public void cancelarSolicitacao(String idReserva) {
        Usuario usuario = getUsuarioLogado();
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));

        if (!reserva.getSolicitante().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode cancelar esta reserva");
        }

        ReservaStatus statusAntigo = reserva.getStatus();

        if (statusAntigo == ReservaStatus.PENDENTE) {
            reserva.setStatus(ReservaStatus.CANCELADO);
            reservaRepository.save(reserva);

            auditoriaService.gravarLog(
                    usuario,
                    "RESERVA_CANCELADA",
                    reserva,
                    "PENDENTE",
                    "CANCELADO",
                    "Reserva cancelada pelo solicitante (pendente): " + reserva.getAmbiente().getNomeSala()
            );
        } else if (statusAntigo == ReservaStatus.APROVADO) {
            reserva.setStatus(ReservaStatus.PENDENTE_CANCELAMENTO);
            reservaRepository.save(reserva);

            auditoriaService.gravarLog(
                    usuario,
                    "SOLICITACAO_CANCELAMENTO_CRIADA",
                    reserva,
                    "APROVADO",
                    "PENDENTE_CANCELAMENTO",
                    "Solicitação de cancelamento de reserva aprovada enviada pelo solicitante: " + reserva.getAmbiente().getNomeSala()
            );
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Esta reserva não pode ser cancelada no estado atual");
        }
    }

    // ─────────────────────────────────────────────
    // Consultas
    // ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarTodas() {
        return reservaRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(ReservaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarPendentes() {
        return reservaRepository.findPendentesGerais()
                .stream().map(ReservaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarMinhasReservas() {
        String idUsuario = getUsuarioLogado().getIdUsuario();
        return reservaRepository.findBySolicitanteIdUsuarioOrderByCreatedAtDesc(idUsuario)
                .stream().map(ReservaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarAprovadasNoPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return reservaRepository.findAprovadasNoPeriodo(inicio, fim)
                .stream().map(ReservaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] gerarPdfOcupacao(String idAmbiente, LocalDateTime inicio, LocalDateTime fim) {
        Usuario logado = getUsuarioLogado();
        if (logado.getPerfil() != UserRole.APROVADOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas gestores podem gerar relatórios em PDF");
        }

        Ambiente ambiente = ambienteRepository.findById(idAmbiente)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ambiente não encontrado"));

        List<Reserva> reservas = reservaRepository.findAprovadasNoPeriodo(inicio, fim)
                .stream()
                .filter(r -> r.getAmbiente().getIdAmbiente().equals(idAmbiente))
                .toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        
        try {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            
            document.open();
            
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new java.awt.Color(239, 143, 35));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(100, 116, 139));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(71, 85, 105));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(51, 65, 85));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(51, 65, 85));
            
            Paragraph title = new Paragraph("CAMPUSGRID - MAPA DE OCUPAÇÃO DA SEMANA", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);
            
            Paragraph subtitle = new Paragraph("UniFil - Centro Universitário Filadélfia", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);
            
            PdfPTable metaTable = new PdfPTable(3);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20);
            
            java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String periodoStr = inicio.format(dtf) + " a " + fim.minusDays(1).format(dtf);
            
            addMetaCell(metaTable, "Ambiente: " + ambiente.getNomeSala() + " (" + ambiente.getCategoria() + ")", normalFont);
            addMetaCell(metaTable, "Período: " + periodoStr, normalFont);
            addMetaCell(metaTable, "Capacidade: " + ambiente.getCapacidade() + " alunos", normalFont);
            document.add(metaTable);
            
            String[] diasSemana = {"Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"};
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm");
            
            for (int i = 0; i < 7; i++) {
                LocalDateTime currentDayStart = inicio.plusDays(i).withHour(0).withMinute(0);
                LocalDateTime currentDayEnd = currentDayStart.plusDays(1);
                
                List<Reserva> dayBookings = new java.util.ArrayList<>();
                for (Reserva r : reservas) {
                    if ((r.getDataInicio().isAfter(currentDayStart) || r.getDataInicio().isEqual(currentDayStart))
                            && r.getDataInicio().isBefore(currentDayEnd)) {
                        dayBookings.add(r);
                    }
                }
                
                Paragraph dayHeader = new Paragraph(diasSemana[i] + " - " + currentDayStart.format(dtf), boldFont);
                dayHeader.setSpacingBefore(10);
                dayHeader.setSpacingAfter(5);
                document.add(dayHeader);
                
                if (dayBookings.isEmpty()) {
                    Paragraph emptyPara = new Paragraph("Nenhuma reserva alocada para este dia.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new java.awt.Color(100, 116, 139)));
                    emptyPara.setSpacingAfter(10);
                    document.add(emptyPara);
                } else {
                    PdfPTable bookingsTable = new PdfPTable(new float[]{1.5f, 2.5f, 4f});
                    bookingsTable.setWidthPercentage(100);
                    bookingsTable.setSpacingAfter(10);
                    
                    addHeaderCell(bookingsTable, "Horário", headerFont);
                    addHeaderCell(bookingsTable, "Solicitante", headerFont);
                    addHeaderCell(bookingsTable, "Finalidade / Observações", headerFont);
                    
                    for (Reserva r : dayBookings) {
                        String timeRange = r.getDataInicio().format(timeFormatter) + " - " + r.getDataFim().format(timeFormatter);
                        addTableCell(bookingsTable, timeRange, normalFont);
                        addTableCell(bookingsTable, r.getSolicitante().getNome(), normalFont);
                        addTableCell(bookingsTable, r.getObservacoes() != null && !r.getObservacoes().isBlank() ? r.getObservacoes() : "NPI / Aula Acadêmica", normalFont);
                    }
                    document.add(bookingsTable);
                }
            }
            
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        }
        
        return out.toByteArray();
    }

    private void addMetaCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new java.awt.Color(241, 245, 249));
        cell.setBorderColor(new java.awt.Color(203, 213, 225));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorderColor(new java.awt.Color(226, 230, 240));
        cell.setPadding(6);
        table.addCell(cell);
    }

    // ─────────────────────────────────────────────
    // Helper interno
    // ─────────────────────────────────────────────

    private Reserva buscarReservaPendente(String idReserva) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
        if (reserva.getStatus() != ReservaStatus.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas reservas pendentes podem ser avaliadas");
        }
        return reserva;
    }
}
