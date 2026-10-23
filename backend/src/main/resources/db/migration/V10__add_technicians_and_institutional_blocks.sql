ALTER TABLE ambientes ADD COLUMN exige_preparacao_tecnica BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE ambiente_tecnicos (
    id_ambiente TEXT NOT NULL REFERENCES ambientes(id_ambiente) ON DELETE CASCADE,
    id_usuario TEXT NOT NULL REFERENCES usuarios(id_usuario),
    PRIMARY KEY (id_ambiente, id_usuario)
);

CREATE TABLE bloqueios_institucionais (
    id_bloqueio TEXT PRIMARY KEY,
    id_campus VARCHAR(40) NOT NULL REFERENCES campi(id_campus),
    id_ambiente TEXT REFERENCES ambientes(id_ambiente),
    id_criador TEXT NOT NULL REFERENCES usuarios(id_usuario),
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    motivo TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bloqueio_periodo CHECK (data_fim > data_inicio)
);

CREATE INDEX idx_bloqueios_campus_periodo
    ON bloqueios_institucionais(id_campus, data_inicio, data_fim) WHERE ativo = TRUE;
