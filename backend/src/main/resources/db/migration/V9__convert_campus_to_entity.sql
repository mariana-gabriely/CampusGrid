CREATE TABLE campi (
    id_campus VARCHAR(40) PRIMARY KEY,
    nome VARCHAR(120) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO campi (id_campus, nome) VALUES
    ('CAMPUS_CANADA', 'Campus Canadá'), ('IPOLON', 'Ipolon'),
    ('SEDE', 'Sede'), ('ENGENHARIA', 'Engenharia');

ALTER TABLE usuarios ADD COLUMN id_campus VARCHAR(40);
UPDATE usuarios SET id_campus = campus;
ALTER TABLE usuarios ALTER COLUMN id_campus SET NOT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_campus FOREIGN KEY (id_campus) REFERENCES campi(id_campus);
DROP INDEX IF EXISTS idx_usuarios_campus;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS chk_usuarios_campus;
ALTER TABLE usuarios DROP COLUMN campus;
CREATE INDEX idx_usuarios_campus ON usuarios(id_campus);

ALTER TABLE ambientes ADD COLUMN id_campus VARCHAR(40);
UPDATE ambientes SET id_campus = campus;
ALTER TABLE ambientes ALTER COLUMN id_campus SET NOT NULL;
ALTER TABLE ambientes ADD CONSTRAINT fk_ambientes_campus FOREIGN KEY (id_campus) REFERENCES campi(id_campus);
DROP INDEX IF EXISTS idx_ambientes_campus;
ALTER TABLE ambientes DROP CONSTRAINT IF EXISTS chk_ambientes_campus;
ALTER TABLE ambientes DROP COLUMN campus;
CREATE INDEX idx_ambientes_campus ON ambientes(id_campus);
