# 📚 Organizador de Atividades Acadêmicas — SENAC Grupo 32

**Projeto Integrador — 2ª Entrega (Prova de Conceito)**
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas — SENAC EAD
Professor: Anderson Clayton Garcia Lopes

🎥 **Vídeo de demonstração (1 minuto):** [vídeo de demonstração](https://youtu.be/wBPfEBL5l0s)

---

## O que é este projeto

Aplicação web que centraliza as atividades acadêmicas de um estudante em um só lugar.
O usuário cria uma conta, cadastra suas disciplinas e registra as atividades de cada uma, com **data de entrega**, **prioridade** e **status** — podendo consultar, editar, concluir, excluir e filtrar tudo isso.

A Prova de Conceito comprova que as funcionalidades essenciais funcionam em conjunto: **cadastro → listagem → edição → exclusão → prioridades → status → filtros**, com frontend, backend e banco de dados integrados.

> 📄 O documento completo da PoC está em [`Projeto Integrador - PoC.docx`](Projeto%20Integrador%20-%20PoC.docx).

---

# 🚀 Como rodar o projeto

> ⏱️ Leva cerca de 10 minutos. Siga os passos **na ordem**.
> Ao final, você precisará de **dois terminais abertos**: um para a API e outro para o site.

## Antes de começar

Instale estes programas:

| Programa                             | Para quê             | Onde baixar                                |
| ------------------------------------ | -------------------- | ------------------------------------------ |
| **Node.js** (versão 22 ou mais nova) | Rodar a API e o site | https://nodejs.org                         |
| **MySQL 8**                          | Banco de dados       | https://dev.mysql.com/downloads/installer/ |
| **Git**                              | Baixar o projeto     | https://git-scm.com                        |

Para conferir se o Node foi instalado, abra o terminal e rode `node -v`.

---

## Passo 1 — Baixar o projeto

```bash
git clone https://github.com/karinyrfernands/senac-grupo-32.git
cd senac-grupo-32
```

---

## Passo 2 — Criar o banco de dados

Abra o **MySQL Workbench** (ou o terminal do MySQL), entre com o usuário `root` e execute os comandos abaixo.
**Troque `SUA_SENHA` por uma senha de sua escolha** — você vai usá-la no passo 3.

```sql
CREATE DATABASE projeto_integrador CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'projeto_api'@'localhost' IDENTIFIED BY 'SUA_SENHA';
GRANT ALL PRIVILEGES ON projeto_integrador.* TO 'projeto_api'@'localhost';
FLUSH PRIVILEGES;
```

> 💡 Use uma senha **sem** caracteres especiais (`@ : / # ?`), porque ela vai dentro de um endereço de conexão.

---

## Passo 3 — Instalar e configurar a API

Ainda na pasta `senac-grupo-32`, entre no backend e instale as dependências:

```bash
cd backend
npm install
```

Crie o arquivo de configuração `.env` a partir do modelo:

```bash
# Windows
copy .env.example .env

# Linux ou macOS
cp .env.example .env
```

Abra o `.env` que acabou de ser criado e faça **duas** alterações:

**a) A senha do banco.** Troque `SUA_SENHA` pela senha criada no passo 2 — ela aparece em **duas linhas**:

```ini
DATABASE_URL="mysql://projeto_api:SUA_SENHA@localhost:3306/projeto_integrador"
DB_PASSWORD=SUA_SENHA
```

**b) A chave de segurança do login.** Rode o comando abaixo, copie o texto gerado e cole no lugar de `TROQUE_ESTE_VALOR`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

```ini
JWT_SECRET=cole_aqui_o_texto_gerado
```

> 🔒 O `.env` guarda senhas e **nunca** é enviado ao GitHub. Cada pessoa cria o seu.

---

## Passo 4 — Criar as tabelas

Continuando na pasta `backend`:

```bash
npx prisma migrate deploy
npm run prisma:generate
```

Isso cria as tabelas `usuarios`, `disciplinas` e `atividades` no banco.

---

## Passo 5 — Ligar a API 🖥️ _(terminal 1)_

```bash
npm run dev
```

Quando aparecer `Servidor executando em http://localhost:3000`, a API está no ar.

✅ **Para testar**, abra no navegador: http://localhost:3000/api/saude
Deve aparecer: `{"status":"API funcionando"}`

> ⚠️ **Deixe este terminal aberto.** Para parar a API, use `Ctrl + C`.

---

## Passo 6 — Ligar o site 🖥️ _(terminal 2)_

Abra um **segundo terminal**, vá até a pasta do projeto e rode:

```bash
cd senac-grupo-32/frontend
npm start
```

O site ficará disponível em **http://localhost:5173**

> ⚠️ **Não abra o `index.html` com duplo-clique.** O navegador bloqueia as chamadas à API por segurança (CORS). É preciso usar o endereço `http://localhost:5173`.

<details>
<summary>Alternativas para servir o site (caso o <code>npm start</code> não funcione)</summary>

```bash
# Com Python
cd frontend
python -m http.server 5173
```

Ou, com a extensão **Live Server** do VS Code: configure a porta para `5173`
em _Settings → Live Server › Port_ e clique em "Go Live".

</details>

---

## Passo 7 — Usar o sistema

1. Acesse **http://localhost:5173**
2. Clique em **"Criar conta"** e cadastre-se (nome, e-mail e senha de no mínimo 6 caracteres)
3. Cadastre uma **disciplina** (ex.: "Banco de Dados") — é necessária para criar atividades
4. Clique em **"+ Nova atividade"** e preencha o formulário
5. Use os **filtros** por disciplina, prioridade e status, e os botões **Concluir / Editar / Excluir** em cada cartão

🎉 Pronto, o sistema está funcionando.

---

# ✅ Funcionalidades entregues

### Conta e acesso

- Cadastro de usuário e login com token JWT
- Cada usuário enxerga **apenas os próprios dados**
- Sessão mantida ao reabrir o navegador (até 7 dias ou até clicar em "Sair")

### Disciplinas

- Cadastrar, listar, editar e excluir
- Contador de atividades por disciplina

### Atividades

- Cadastrar com título, descrição, disciplina, data de entrega, prioridade e status
- Listar, consultar, editar e excluir
- Marcar como concluída com um clique
- **Prioridade:** Baixa · Média · Alta
- **Status:** Pendente · Em andamento · Concluída
- Destaque visual de prioridade e aviso de **prazo atrasado**

### Filtros e ordenação

- Filtrar por disciplina, prioridade e status — **combináveis entre si**
- Ordenar por data de entrega, título, prioridade, status ou data de criação

### Interface

- Layout **responsivo**, adaptado para celular e computador
- Mensagens de confirmação e de erro em todas as ações

---

# 🛠️ Tecnologias

| Camada             | Tecnologias                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| **Frontend**       | HTML5, CSS3 e JavaScript puro (sem frameworks)                               |
| **Backend**        | Node.js, Express 5, TypeScript, Zod (validação), JWT + bcrypt (autenticação) |
| **Banco de dados** | MySQL 8 com Prisma ORM (migrations versionadas)                              |
| **Ferramentas**    | VS Code, Postman, Git e GitHub                                               |

---

# 🏗️ Arquitetura do sistema

A aplicação segue o modelo **cliente-servidor em três camadas**, com o frontend totalmente separado da API.

```
┌─────────────────────────────────────────────────┐
│  NAVEGADOR          http://localhost:5173       │
│  Frontend — HTML + CSS + JavaScript puro        │
│  index.html · css/style.css · js/app.js         │
└─────────────────────────────────────────────────┘
                      │
                      │  fetch() em JSON
                      │  Authorization: Bearer <token>
                      ▼
┌─────────────────────────────────────────────────┐
│  API REST           http://localhost:3000       │
│  Node.js + Express + TypeScript                 │
│                                                 │
│   routes/       →  endereços da API             │
│   middlewares/  →  autenticação JWT e erros     │
│   schemas/      →  validação dos dados (Zod)    │
│   controllers/  →  regras de negócio            │
└─────────────────────────────────────────────────┘
                      │
                      │  Prisma ORM
                      ▼
┌─────────────────────────────────────────────────┐
│  BANCO DE DADOS     MySQL 8                     │
│  projeto_integrador                             │
│  usuarios · disciplinas · atividades            │
└─────────────────────────────────────────────────┘
```

**Como uma requisição é processada:** o navegador envia o pedido com o token → o middleware `autenticar` valida o token e identifica o usuário → o `schema` do Zod valida os dados recebidos → o `controller` aplica as regras e consulta o banco pelo Prisma → a resposta volta em JSON. Qualquer erro no caminho é capturado pelo `errorHandler`, que devolve sempre o mesmo formato de mensagem.

**Segurança:** senhas gravadas com hash bcrypt (nunca em texto puro), rotas protegidas por token JWT, CORS liberado apenas para o endereço do frontend e todo texto exibido na tela é escapado contra XSS.

---

# 🗄️ Modelagem de dados

```
                  ┌───────────────────────┐
                  │       usuarios        │
                  ├───────────────────────┤
                  │ id             (PK)   │
                  │ nome                  │
                  │ email          (único)│
                  │ senha_hash            │
                  └───────────┬───────────┘
                              │
              ┌───────────────┴───────────────┐
              │ 1:N                       1:N │
              ▼                               ▼
  ┌───────────────────────┐       ┌────────────────────────┐
  │     disciplinas       │       │      atividades        │
  ├───────────────────────┤       ├────────────────────────┤
  │ id             (PK)   │  1:N  │ id              (PK)   │
  │ nome                  ├──────►│ titulo                 │
  │ usuario_id     (FK)   │       │ descricao              │
  └───────────────────────┘       │ data_entrega           │
                                  │ prioridade      (enum) │
                                  │ status          (enum) │
                                  │ disciplina_id   (FK)   │
                                  │ usuario_id      (FK)   │
                                  └────────────────────────┘
```

### `usuarios`

| Coluna                      | Tipo                 | Observação                                          |
| --------------------------- | -------------------- | --------------------------------------------------- |
| `id`                        | INT, auto incremento | Chave primária                                      |
| `nome`                      | VARCHAR(100)         | Obrigatório                                         |
| `email`                     | VARCHAR(150)         | **Único** — não há dois usuários com o mesmo e-mail |
| `senha_hash`                | VARCHAR(255)         | Senha criptografada com bcrypt                      |
| `created_at` / `updated_at` | DATETIME(3)          | Controle de datas                                   |

### `disciplinas`

| Coluna                      | Tipo                 | Observação                        |
| --------------------------- | -------------------- | --------------------------------- |
| `id`                        | INT, auto incremento | Chave primária                    |
| `nome`                      | VARCHAR(100)         | Único **por usuário**             |
| `usuario_id`                | INT                  | Chave estrangeira → `usuarios.id` |
| `created_at` / `updated_at` | DATETIME(3)          | Controle de datas                 |

### `atividades`

| Coluna                      | Tipo                 | Observação                                                     |
| --------------------------- | -------------------- | -------------------------------------------------------------- |
| `id`                        | INT, auto incremento | Chave primária                                                 |
| `titulo`                    | VARCHAR(150)         | Obrigatório, mínimo 3 caracteres                               |
| `descricao`                 | TEXT                 | Opcional                                                       |
| `data_entrega`              | DATETIME(3)          | Obrigatório                                                    |
| `prioridade`                | ENUM                 | `BAIXA` · `MEDIA` · `ALTA` (padrão: `MEDIA`)                   |
| `status`                    | ENUM                 | `PENDENTE` · `EM_ANDAMENTO` · `CONCLUIDA` (padrão: `PENDENTE`) |
| `disciplina_id`             | INT                  | Chave estrangeira → `disciplinas.id`                           |
| `usuario_id`                | INT                  | Chave estrangeira → `usuarios.id`                              |
| `created_at` / `updated_at` | DATETIME(3)          | Controle de datas                                              |

**Relacionamentos:** um usuário tem várias disciplinas e várias atividades; uma disciplina tem várias atividades.
Há índices em `data_entrega`, `prioridade`, `status`, `disciplina_id` e `usuario_id` para acelerar os filtros.
Uma disciplina só pode ser excluída se não tiver atividades vinculadas.

> O modelo é definido em [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) e aplicado pelas migrations em [`backend/prisma/migrations/`](backend/prisma/migrations/).

---

# 📁 Estrutura do projeto

```text
senac-grupo-32/
│
├── frontend/                    → Interface do usuário
│   ├── index.html               → Telas de login e da aplicação
│   ├── css/style.css            → Estilos e responsividade
│   └── js/
│       ├── api.js               → Comunicação com a API e controle do token
│       └── app.js               → Lógica da interface e eventos
│
├── backend/                     → API REST
│   ├── src/
│   │   ├── server.ts            → Inicia o servidor
│   │   ├── app.ts               → Configura o Express, CORS e as rotas
│   │   ├── routes/              → Endereços da API
│   │   ├── controllers/         → Regras de negócio
│   │   ├── middlewares/         → Autenticação JWT e tratamento de erros
│   │   ├── schemas/             → Validação dos dados (Zod)
│   │   ├── database/            → Conexão com o MySQL
│   │   └── utils/               → Token JWT e classe de erro
│   ├── prisma/
│   │   ├── schema.prisma        → Modelagem do banco
│   │   └── migrations/          → Histórico de alterações do banco
│   ├── .env.example             → Modelo de configuração
│   ├── DOCUMENTACAO_API.md      → Documentação completa das rotas
│   └── Projeto Integrador - API.postman_collection.json
│
├── Projeto Integrador - PoC.docx → Documento da Prova de Conceito
└── README.md                     → Este arquivo
```

---

# 🔌 API

A documentação completa das rotas, com exemplos de requisição e resposta, está em
**[`backend/DOCUMENTACAO_API.md`](backend/DOCUMENTACAO_API.md)**.

Para testar no Postman, importe o arquivo
[`backend/Projeto Integrador - API.postman_collection.json`](backend/Projeto%20Integrador%20-%20API.postman_collection.json).

Resumo dos endereços (base: `http://localhost:3000`):

| Método   | Rota                           | O que faz                    | Precisa de token |
| -------- | ------------------------------ | ---------------------------- | :--------------: |
| `GET`    | `/api/saude`                   | Verifica se a API está no ar |        —         |
| `POST`   | `/api/auth/cadastro`           | Cria uma conta               |        —         |
| `POST`   | `/api/auth/login`              | Entra e recebe o token       |        —         |
| `GET`    | `/api/auth/me`                 | Dados do usuário logado      |        ✅        |
| `POST`   | `/api/disciplinas`             | Cadastra disciplina          |        ✅        |
| `GET`    | `/api/disciplinas`             | Lista disciplinas            |        ✅        |
| `GET`    | `/api/disciplinas/:id`         | Consulta uma disciplina      |        ✅        |
| `PATCH`  | `/api/disciplinas/:id`         | Edita disciplina             |        ✅        |
| `DELETE` | `/api/disciplinas/:id`         | Exclui disciplina            |        ✅        |
| `POST`   | `/api/atividades`              | Cadastra atividade           |        ✅        |
| `GET`    | `/api/atividades`              | Lista e filtra atividades    |        ✅        |
| `GET`    | `/api/atividades/:id`          | Consulta uma atividade       |        ✅        |
| `PATCH`  | `/api/atividades/:id`          | Edita atividade              |        ✅        |
| `PATCH`  | `/api/atividades/:id/concluir` | Marca como concluída         |        ✅        |
| `DELETE` | `/api/atividades/:id`          | Exclui atividade             |        ✅        |

---

# 👥 Equipe de desenvolvimento

| Integrante                  | Responsabilidade                             |
| --------------------------- | -------------------------------------------- |
| Sérgio Meyer Vassão         | Definição da Prova de Conceito (PoC)         |
| Gilson Muniz Barreto Junior | Preparação do ambiente e banco de dados      |
| Paloma Thamires da Silva    | Desenvolvimento do frontend                  |
| Lucas Menezes Marcelino     | Desenvolvimento do backend                   |
| Kariny Rodrigues Fernandes  | GitHub, documentação e vídeo de apresentação |

---

# 🔧 Comandos úteis

Na pasta `backend`:

| Comando                     | O que faz                                             |
| --------------------------- | ----------------------------------------------------- |
| `npm run dev`               | Inicia a API e reinicia sozinha quando o código muda  |
| `npm start`                 | Inicia a API normalmente                              |
| `npm run prisma:studio`     | Abre uma tela no navegador para ver os dados do banco |
| `npx prisma migrate deploy` | Aplica as migrations (cria/atualiza as tabelas)       |

Na pasta `frontend`:

| Comando     | O que faz                             |
| ----------- | ------------------------------------- |
| `npm start` | Serve o site em http://localhost:5173 |

### Depois de um `git pull`

Se o backend mudou, rode na pasta `backend`:

```bash
npm install
npx prisma migrate deploy
npm run prisma:generate
```

---

# ❓ Problemas comuns

**O site abre, mas o login não funciona / nada acontece ao clicar**
Confira se a API está rodando (passo 5) e se você acessou o site por `http://localhost:5173`, e não abrindo o `index.html` com duplo-clique.

**Login e cadastro devolvem erro 500, e a API demora ~10 segundos para responder**
É o banco recusando a conexão. Verifique se o `DB_NAME` do `.env` é `projeto_integrador` — o mesmo banco criado no passo 2 — e se o MySQL está rodando.

**`JWT_SECRET não está configurado corretamente`**
Falta a linha `JWT_SECRET` no `.env`, ou ela ainda está com o valor `TROQUE_ESTE_VALOR`. Gere a chave pelo comando do passo 3 e reinicie a API.

**`Access denied for user`**
O usuário ou a senha do `.env` não conferem com os criados no passo 2.

**`Can't reach database server`**
O MySQL não está rodando. Inicie o serviço do MySQL pelo Painel de Serviços do Windows.

**Erro de CORS no navegador**
O endereço em `FRONTEND_URL` (no `.env`) precisa ser idêntico ao que está na barra do navegador, inclusive a porta. Depois de alterar o `.env`, reinicie a API.

**`EADDRINUSE` (porta em uso)**
Outro programa está usando a porta 3000. Feche-o ou altere `PORT` no `.env`.

**`migrate` reclama de tabelas existentes ou de permissão**
Rode `npx prisma migrate reset` (atenção: **apaga todos os dados** do banco local e recria as tabelas). Se o erro for de permissão, execute no MySQL como `root`:
`GRANT ALL PRIVILEGES ON *.* TO 'projeto_api'@'localhost'; FLUSH PRIVILEGES;`

**Erro 401 `TOKEN_AUSENTE` ou `TOKEN_INVALIDO`**
A sessão expirou (o token vale 7 dias). Faça login novamente.

---

<div align="center">

**SENAC EAD — Projeto Integrador 2026**
Desenvolvimento de Sistemas Orientado a Dispositivos Móveis e Baseados na Web

</div>
