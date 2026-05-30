CREATE TABLE usuarios (
    id_usuario TEXT PRIMARY KEY UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO usuarios (id_usuario, nome, email, senha, perfil, ativo)
VALUES (
    gen_random_uuid(), 
    'Administrador CampusGrid', 
    'admin@unifil.br', 
    '$2a$10$pzIsJpmc/CrRAzOH37IfK.fs34J3fnHsHN7VPsnVpcT285lrin/e.',
    'APROVADOR', 
    TRUE
);
