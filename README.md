# CampusGrid

Sistema de gestão de reservas de salas, laboratórios e auditórios, com aprovação, permutas, mapa de ocupação e trilha de auditoria.

## Tecnologias

- Backend: Java 21, Spring Boot, Spring Security, JPA, Flyway e PostgreSQL.
- Frontend: React, TypeScript, Vite e Tailwind CSS.
- Autenticação: JWT, com perfis `SOLICITANTE` e `APROVADOR`.

## Pré-requisitos

- JDK 21
- Node.js 20 ou superior
- PostgreSQL 15 ou superior

## Configuração

Crie o banco `campusgrid` e defina as variáveis abaixo. No PowerShell:

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/campusgrid"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="sua-senha"
$env:JWT_SECRET="use-um-segredo-longo-aleatorio-com-pelo-menos-32-caracteres"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
$env:RESEND_API_KEY="re_sua_chave"
$env:RESEND_FROM_EMAIL="CampusGrid <noreply@seu-dominio.com>"
```

Para habilitar a recuperação de senha, crie uma conta no Resend, valide o domínio remetente e gere uma API key. Em testes iniciais, o remetente de testes fornecido pelo Resend pode ter restrições de destinatário. A senha do usuário só é alterada depois que o Resend aceita o envio.

Para o frontend, copie `frontend/.env.example` para `frontend/.env.local` se a API não estiver em `http://localhost:8080`.

## Execução

Backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Frontend, em outro terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

A aplicação abre em `http://localhost:5173`. Swagger: `http://localhost:8080/swagger-ui.html`.

## Build

```powershell
cd backend
.\mvnw.cmd verify

cd ..\frontend
npm.cmd ci
npm.cmd run build
```

As migrações Flyway em `backend/src/main/resources/db/migration` são aplicadas automaticamente. Não armazene senhas ou o segredo JWT no repositório.

## Estrutura

- `backend/`: API REST, regras de negócio e persistência.
- `frontend/`: interface web.
- `diagramas/`: diagramas UML e de implantação.
- `documentacao/`: artefatos de documentação do projeto.
