ALTER TABLE usuarios ADD COLUMN campus TEXT NOT NULL DEFAULT 'SEDE';
ALTER TABLE ambientes ADD COLUMN campus TEXT NOT NULL DEFAULT 'SEDE';

ALTER TABLE usuarios ADD CONSTRAINT chk_usuarios_campus
    CHECK (campus IN ('CAMPUS_CANADA', 'IPOLON', 'SEDE', 'ENGENHARIA'));
ALTER TABLE ambientes ADD CONSTRAINT chk_ambientes_campus
    CHECK (campus IN ('CAMPUS_CANADA', 'IPOLON', 'SEDE', 'ENGENHARIA'));

CREATE INDEX idx_usuarios_campus ON usuarios(campus);
CREATE INDEX idx_ambientes_campus ON ambientes(campus);
