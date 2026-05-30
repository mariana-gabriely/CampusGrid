CREATE TABLE ambientes (
    id_ambiente TEXT PRIMARY KEY UNIQUE NOT NULL,
    nome_sala TEXT NOT NULL,
    capacidade INTEGER NOT NULL,
    categoria TEXT NOT NULL,
    exclusivo_curso TEXT,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fichas_tecnicas (
    id_ficha TEXT PRIMARY KEY UNIQUE NOT NULL,
    id_ambiente TEXT NOT NULL UNIQUE,
    observacoes TEXT,
    FOREIGN KEY (id_ambiente) REFERENCES ambientes(id_ambiente) ON DELETE CASCADE
);

CREATE TABLE ficha_tecnica_recursos (
    id_ficha TEXT NOT NULL,
    descricao TEXT NOT NULL,
    FOREIGN KEY (id_ficha) REFERENCES fichas_tecnicas(id_ficha) ON DELETE CASCADE
);
