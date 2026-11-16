# SENAC Grupo 32 — Sistema de Gerenciamento de Atividades

## Sobre o projeto

Este projeto está sendo desenvolvido como parte de uma atividade acadêmica do SENAC.

O objetivo é desenvolver um sistema web de gerenciamento de atividades acadêmicas, permitindo que os usuários organizem suas tarefas e acompanhem suas atividades de acordo com a disciplina, prioridade e status.

A aplicação contará com uma interface simples e intuitiva, permitindo cadastrar, consultar, editar, excluir e concluir atividades.

## Objetivo da PoC (Prova de Conceito)

A Prova de Conceito tem como objetivo demonstrar o funcionamento das principais funcionalidades de um sistema de gerenciamento de atividades acadêmicas.

O foco é desenvolver uma aplicação funcional que permita organizar atividades de diferentes disciplinas, facilitando o acompanhamento das tarefas e suas prioridades.

## Funcionalidades do sistema

### Backend

O backend será responsável pelo processamento das informações e pela comunicação com o banco de dados MySQL.

Funcionalidades previstas:

- Cadastrar uma atividade.
- Consultar todas as atividades.
- Consultar uma atividade específica.
- Editar uma atividade.
- Excluir uma atividade.
- Marcar uma atividade como concluída.
- Filtrar atividades por disciplina.
- Filtrar atividades por prioridade.
- Filtrar atividades por status.
- Permitir a combinação de diferentes filtros simultaneamente.

### Frontend

O frontend será responsável pela interface de interação com o usuário.

Funcionalidades previstas:

- Criar a interface principal do sistema.
- Desenvolver o formulário de cadastro de atividades.
- Exibir a listagem de atividades cadastradas.
- Disponibilizar filtros de pesquisa.
- Implementar ações para editar, excluir e concluir atividades.
- Adaptar a interface para dispositivos móveis.

## Tecnologias e ferramentas utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js

### Banco de dados
- MySQL

### Ferramentas de desenvolvimento
- Visual Studio Code (VS Code)
- Postman
- Git
- GitHub

## Estrutura do projeto

A estrutura do repositório será organizada para separar o frontend e o backend:

```text
senac-grupo-32/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── ...
│
├── backend/
│   ├── ...
│
├── README.md
└── ...
```

*A estrutura poderá ser atualizada conforme a implementação do sistema.*

## Como executar o projeto

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js
- MySQL
- Git

Recomenda-se utilizar o Visual Studio Code para editar o código.

### Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### Acessar a pasta do projeto

```bash
cd senac-grupo-32
```

### Executar o backend

O backend (API) é feito em Node.js e precisa de um banco MySQL/MariaDB. O passo a passo completo (instalar dependências, criar o banco, configurar o `.env` e rodar) está em [`backend/README.md`](backend/README.md).

Resumo:

```bash
cd backend
npm install
# configure o arquivo .env (veja backend/README.md)
npx prisma migrate deploy
npm run dev
```

A API sobe em `http://localhost:3000`. Para testar, acesse `http://localhost:3000/api/saude`.

### Executar o frontend

O frontend é feito em HTML, CSS e JavaScript puro e **precisa ser servido em `http://localhost:5173`** — essa é a origem liberada pelo CORS da API. Não abra o `index.html` com duplo-clique (`file://`), pois o navegador bloqueia as chamadas à API.

```bash
cd frontend
npm start          # usa Node.js (npx serve) na porta 5173
# ou, alternativamente:
python -m http.server 5173
```

Depois, abra no navegador: **http://localhost:5173**

> Para o sistema funcionar por completo, o backend precisa estar rodando em `http://localhost:3000`. Mais detalhes do frontend em [`frontend/README.md`](frontend/README.md).

## Equipe de desenvolvimento

| Integrante | Responsabilidade |
|---|---|
| Sérgio | Definição da Prova de Conceito (PoC) |
| Gilson | Preparação do ambiente e banco de dados |
| Paloma | Desenvolvimento do frontend |
| Lucas | Desenvolvimento do backend |
| Kariny | GitHub, documentação e vídeo de apresentação |

## Status do projeto

Em desenvolvimento.

---
