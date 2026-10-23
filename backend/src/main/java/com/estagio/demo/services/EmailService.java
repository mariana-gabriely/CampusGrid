package com.estagio.demo.services;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final String apiKey;
    private final String remetente;

    public EmailService(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:}") String remetente) {
        this.apiKey = apiKey;
        this.remetente = remetente;
    }

    public void enviarRecuperacaoSenha(String destinatario, String senhaTemporaria) {
        if (apiKey.isBlank() || remetente.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "O serviço de e-mail não está configurado");
        }

        var email = CreateEmailOptions.builder()
                .from(remetente)
                .to(destinatario)
                .subject("Recuperação de senha - CampusGrid")
                .html("""
                        <h2>Recuperação de senha</h2>
                        <p>Foi solicitada uma nova senha para sua conta no CampusGrid.</p>
                        <p>Sua senha temporária é: <strong>%s</strong></p>
                        <p>Entre no sistema e altere a senha assim que possível.</p>
                        <p>Se você não fez esta solicitação, entre em contato com a administração.</p>
                        """.formatted(senhaTemporaria))
                .build();

        try {
            new Resend(apiKey).emails().send(email);
        } catch (ResendException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Não foi possível enviar o e-mail de recuperação", exception);
        }
    }

    public void enviarNotificacao(String destinatario, String assunto, String mensagem) {
        if (destinatario == null || destinatario.isBlank()) return;
        if (apiKey.isBlank() || remetente.isBlank()) {
            log.warn("Notificação não enviada para {}: Resend não configurado", destinatario);
            return;
        }
        var email = CreateEmailOptions.builder().from(remetente).to(destinatario)
                .subject(assunto).html("<p>" + escapar(mensagem) + "</p>").build();
        try {
            new Resend(apiKey).emails().send(email);
        } catch (ResendException exception) {
            log.error("Falha ao enviar notificação para {}", destinatario, exception);
        }
    }

    private String escapar(String texto) {
        return texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
