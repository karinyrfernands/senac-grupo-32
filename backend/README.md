# Projeto Integrador – Backend (API)

API do sistema de organização de atividades acadêmicas. Permite criar uma conta, fazer login e, a partir daí, cadastrar disciplinas e atividades (com prioridade, status e data de entrega), editar, excluir, concluir e filtrar. **Cada usuário enxerga apenas os próprios dados.**

**Tecnologias:** Node.js, Express, TypeScript (tsx), Prisma, MySQL e autenticação com token JWT.

> A lista completa de rotas está em [`DOCUMENTACAO_API.md`](DOCUMENTACAO_API.md).
> Este projeto faz parte do repositório do Grupo 32 (SENAC). O backend está na pasta `backend`.

---

## 1. O que precisa estar instalado

| Programa | Para quê | Onde baixar |
| --- | --- | --- |
| Node.js (versão LTS, 22 ou mais nova) | Rodar a API | https://nodejs.org |
| MySQL 8 | Banco de dados | https://dev.mysql.com/downloads/installer/ |
| Git | Baixar o projeto | https://git-scm.com |
| VS Code (opcional) | Editor | https://code.visualstudio.com |

Para conferir se o Node foi instalado, abra o terminal e rode `node -v`.

## 2. Baixar o projeto

```bash
git clone https://github.com/karinyrfernands/senac-grupo-32.git
cd senac-grupo-32/backend
npm install
```

> O backend fica na pasta `backend` do repositório do grupo. Todos os comandos deste README devem ser executados **dentro dessa pasta** (`senac-grupo-32/backend`).

## 3. Criar o banco de dados

Abra o MySQL (MySQL Workbench ou o terminal do MySQL), entre com o usuário `root` e execute os comandos abaixo, **trocando `SUA_SENHA` por uma senha de sua escolha**:

```sql
CREATE DATABASE projeto_integrador CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'projeto_api'@'localhost' IDENTIFIED BY 'SUA_SENHA';
GRANT ALL PRIVILEGES ON projeto_integrador.* TO 'projeto_api'@'localhost';
FLUSH PRIVILEGES;
```

## 4. Configurar o arquivo `.env`

Na pasta do projeto, crie o `.env` a partir do modelo:

```bash
copy .env.example .env
```

Abra o `.env` no VS Code e troque `SUA_SENHA` (nas **duas** linhas em que aparece) pela senha criada no passo 3.

**Chave do login (`JWT_SECRET`):** rode o comando abaixo no terminal, copie o texto que aparecer e cole no `.env` no lugar de `TROQUE_ESTE_VALOR`. Cada pessoa gera a sua própria chave, e ela nunca vai para o GitHub.

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Se o frontend rodar em outra porta, ajuste também `FRONTEND_URL` (exemplo: `http://localhost:5173`).

## 5. Criar as tabelas

```bash
npx prisma migrate deploy
npm run prisma:generate
```

## 6. Rodar a API

```bash
npm run dev
```

Quando aparecer `Servidor executando em http://localhost:3000`, a API está no ar. Para testar, abra no navegador:

http://localhost:3000/api/saude

Deve aparecer `{"status":"API funcionando"}`.

Para usar o sistema, é preciso criar uma conta (`POST /api/auth/cadastro`) e fazer login (`POST /api/auth/login`). As demais rotas só funcionam com o token recebido. Os detalhes estão em [`DOCUMENTACAO_API.md`](DOCUMENTACAO_API.md).

Para parar o servidor, use `Ctrl + C` no terminal.

---

## Atualizando o projeto depois de um `git pull`

Sempre que alguém avisar que o backend mudou, rode na pasta `backend`:

```bash
npm install
npx prisma migrate deploy
npm run prisma:generate
```

**Atualização que adicionou o login:** além dos comandos acima, é preciso (1) incluir a linha `JWT_SECRET` no seu `.env` (veja o passo 4) e (2) apagar os dados de teste antigos, porque agora todo dado pertence a um usuário. Para isso, use no lugar do `migrate deploy`:

```bash
npx prisma migrate reset
```

Ele pede confirmação (digite `y`) e **apaga todos os dados do banco local**, recriando as tabelas já na versão nova. Depois rode `npm run prisma:generate`.

---

## Comandos úteis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia a API e reinicia sozinha quando o código muda |
| `npm start` | Inicia a API normalmente |
| `npm run prisma:studio` | Abre uma tela para ver os dados do banco |

## Problemas comuns

- **`JWT_SECRET não está configurado corretamente`**: falta a linha `JWT_SECRET` no `.env`, ou ela ainda está com o valor `TROQUE_ESTE_VALOR`. Gere a chave pelo comando do passo 4 e reinicie a API.
- **Erro 401 `TOKEN_AUSENTE` ou `TOKEN_INVALIDO`**: faça login de novo e envie o token no cabeçalho `Authorization: Bearer <token>`. O token vale por 7 dias.
- **`migrate` reclama de linhas existentes ou de permissão para criar banco**: use `npx prisma migrate reset`. Se o erro for de permissão (shadow database), rode no MySQL como `root`: `GRANT ALL PRIVILEGES ON *.* TO 'projeto_api'@'localhost'; FLUSH PRIVILEGES;`

- **`Access denied for user`**: usuário ou senha do `.env` não conferem com os criados no MySQL.
- **`Can't reach database server`**: o MySQL não está rodando. Inicie o serviço do MySQL.
- **Erro de CORS no navegador do frontend**: o endereço em `FRONTEND_URL` não é idêntico ao do frontend (confira a porta). Depois de alterar o `.env`, reinicie a API.
- **`EADDRINUSE` (porta em uso)**: outro programa usa a porta 3000. Altere `PORT` no `.env` ou feche o outro programa.
