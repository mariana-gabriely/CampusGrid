CREATE TABLE permutas (
    id_permuta TEXT PRIMARY KEY UNIQUE NOT NULL,
    id_reserva_solicitante TEXT NOT NULL,
    id_reserva_destinatario TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE_ACEITE',
    motivo_recusa TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_reserva_solicitante) REFERENCES reservas(id_reserva) ON DELETE CASCADE,
    FOREIGN KEY (id_reserva_destinatario) REFERENCES reservas(id_reserva) ON DELETE CASCADE
);
