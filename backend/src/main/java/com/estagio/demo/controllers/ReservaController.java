package com.estagio.demo.controllers;

import com.estagio.demo.dto.reserva.AvaliacaoRequestDTO;
import com.estagio.demo.dto.reserva.ReservaRequestDTO;
import com.estagio.demo.dto.reserva.ReservaResponseDTO;
import com.estagio.demo.services.ReservaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    @Autowired
    private ReservaService service;

    /** Solicitante cria uma reserva via JSON */
    @PostMapping(consumes = { "application/json" })
    public ResponseEntity<ReservaResponseDTO> solicitarReservaJson(@RequestBody @Valid ReservaRequestDTO data) {
        return ResponseEntity.ok(service.solicitarReserva(data, null));
    }

    /** Solicitante cria uma reserva via Multipart (com anexo) */
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ReservaResponseDTO> solicitarReservaMultipart(
            @RequestParam("idAmbiente") String idAmbiente,
            @RequestParam("dataInicio") String dataInicio,
            @RequestParam("dataFim") String dataFim,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            @RequestParam(value = "publicoEsperado", required = false) Integer publicoEsperado,
            @RequestParam(value = "recursosRequisitados", required = false) List<String> recursosRequisitados,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file
    ) {
        ReservaRequestDTO dto = new ReservaRequestDTO(
                idAmbiente,
                LocalDateTime.parse(dataInicio),
                LocalDateTime.parse(dataFim),
                observacoes,
                publicoEsperado,
                recursosRequisitados
        );
        return ResponseEntity.ok(service.solicitarReserva(dto, file));
    }

    /** Solicitante atualiza uma reserva via JSON */
    @PutMapping(value = "/{id}", consumes = { "application/json" })
    public ResponseEntity<ReservaResponseDTO> atualizarReservaJson(
            @PathVariable String id,
            @RequestBody @Valid ReservaRequestDTO data) {
        return ResponseEntity.ok(service.atualizarReserva(id, data, null));
    }

    /** Solicitante atualiza uma reserva via Multipart (com anexo opcional/novo) */
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<ReservaResponseDTO> atualizarReservaMultipart(
            @PathVariable String id,
            @RequestParam("idAmbiente") String idAmbiente,
            @RequestParam("dataInicio") String dataInicio,
            @RequestParam("dataFim") String dataFim,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            @RequestParam(value = "publicoEsperado", required = false) Integer publicoEsperado,
            @RequestParam(value = "recursosRequisitados", required = false) List<String> recursosRequisitados,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file
    ) {
        ReservaRequestDTO dto = new ReservaRequestDTO(
                idAmbiente,
                LocalDateTime.parse(dataInicio),
                LocalDateTime.parse(dataFim),
                observacoes,
                publicoEsperado,
                recursosRequisitados
        );
        return ResponseEntity.ok(service.atualizarReserva(id, dto, file));
    }

    /** Obter detalhes de uma reserva específica */
    @GetMapping("/{id}")
    public ResponseEntity<ReservaResponseDTO> obterPorId(@PathVariable String id) {
        return ResponseEntity.ok(new ReservaResponseDTO(service.buscarReservaEntidade(id)));
    }

    /** Baixar o anexo da reserva */
    @GetMapping("/{id}/anexo")
    public ResponseEntity<byte[]> baixarAnexo(@PathVariable String id) {
        var reserva = service.buscarReservaEntidade(id);
        if (reserva.getAnexoConteudo() == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Esta reserva não possui anexo");
        }
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + reserva.getAnexoNome() + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(reserva.getAnexoConteudo());
    }

    /** Solicitante cancela sua própria reserva pendente */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarSolicitacao(@PathVariable String id) {
        service.cancelarSolicitacao(id);
        return ResponseEntity.noContent().build();
    }

    /** Solicitante lista suas próprias reservas */
    @GetMapping("/minhas")
    public ResponseEntity<List<ReservaResponseDTO>> listarMinhas() {
        return ResponseEntity.ok(service.listarMinhasReservas());
    }

    /** Aprovador lista todas as reservas */
    @GetMapping
    public ResponseEntity<List<ReservaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    /** Aprovador lista apenas pendentes */
    @GetMapping("/pendentes")
    public ResponseEntity<List<ReservaResponseDTO>> listarPendentes() {
        return ResponseEntity.ok(service.listarPendentes());
    }

    /** Aprovador aprova uma reserva */
    @PatchMapping("/{id}/aprovar")
    public ResponseEntity<ReservaResponseDTO> aprovar(@PathVariable String id) {
        return ResponseEntity.ok(service.aprovarReserva(id));
    }

    /** Aprovador recusa uma reserva */
    @PatchMapping("/{id}/recusar")
    public ResponseEntity<ReservaResponseDTO> recusar(
            @PathVariable String id,
            @RequestBody AvaliacaoRequestDTO data) {
        return ResponseEntity.ok(service.recusarReserva(id, data));
    }

    /** Dashboard — reservas aprovadas em um período */
    @GetMapping("/ocupacao")
    public ResponseEntity<List<ReservaResponseDTO>> ocupacaoNoPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(service.listarAprovadasNoPeriodo(inicio, fim));
    }

    @GetMapping("/ocupacao/pdf")
    public ResponseEntity<byte[]> exportarOcupacaoPdf(
            @RequestParam String idAmbiente,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        byte[] pdfBytes = service.gerarPdfOcupacao(idAmbiente, inicio, fim);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"relatorio_ocupacao.pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
