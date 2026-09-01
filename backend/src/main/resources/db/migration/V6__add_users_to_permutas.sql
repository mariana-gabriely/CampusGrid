ALTER TABLE permutas ADD COLUMN id_usuario_solicitante TEXT;
ALTER TABLE permutas ADD COLUMN id_usuario_destinatario TEXT;

-- Update existing rows using the foreign keys of the reservations
UPDATE permutas p
SET id_usuario_solicitante = (SELECT id_solicitante FROM reservas r WHERE r.id_reserva = p.id_reserva_solicitante),
    id_usuario_destinatario = (SELECT id_solicitante FROM reservas r WHERE r.id_reserva = p.id_reserva_destinatario);

-- Make columns NOT NULL
ALTER TABLE permutas ALTER COLUMN id_usuario_solicitante SET NOT NULL;
ALTER TABLE permutas ALTER COLUMN id_usuario_destinatario SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE permutas ADD CONSTRAINT fk_permutas_usuario_solicitante FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
ALTER TABLE permutas ADD CONSTRAINT fk_permutas_usuario_destinatario FOREIGN KEY (id_usuario_destinatario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE;
