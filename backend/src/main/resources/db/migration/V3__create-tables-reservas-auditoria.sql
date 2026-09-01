CREATE TABLE reservas (
    id_reserva      TEXT PRIMARY KEY UNIQUE NOT NULL,
    id_ambiente     TEXT NOT NULL,
    id_solicitante  TEXT NOT NULL,
    data_inicio     TIMESTAMP NOT NULL,
    data_fim        TIMESTAMP NOT NULL,
    status          TEXT NOT NULL DEFAULT 'PENDENTE',
    observacoes     TEXT,
    id_aprovador    TEXT,
    data_avaliacao  TIMESTAMP,
    motivo_recusa   TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_ambiente)    REFERENCES ambientes(id_ambiente),
    FOREIGN KEY (id_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_aprovador)   REFERENCES usuarios(id_usuario)
);

CREATE TABLE logs_auditoria (
    id_log          TEXT PRIMARY KEY UNIQUE NOT NULL,
    acao            TEXT NOT NULL,
    id_usuario      TEXT NOT NULL,
    id_reserva      TEXT,
    valor_antigo    TEXT,
    valor_novo      TEXT,
    detalhes        TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva) ON DELETE SET NULL
);
