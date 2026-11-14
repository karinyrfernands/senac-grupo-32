# Documentação da API

**Endereço base (local):** `http://localhost:3000`
**Formato:** JSON. Em requisições com corpo (POST e PATCH), envie o cabeçalho `Content-Type: application/json`.

## Autenticação (login)

Quase todas as rotas exigem que o usuário esteja logado. O fluxo é:

1. O usuário cria uma conta (`POST /api/auth/cadastro`) ou entra (`POST /api/auth/login`). Ambas devolvem um **token**.
2. O frontend guarda o token (por exemplo, no `localStorage`).
3. Em **toda** chamada às rotas de disciplinas e atividades, envia o cabeçalho:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

4. Se a API responder **401**, o token não existe, é inválido ou expirou (validade de 7 dias): apague o token guardado e leve o usuário para a tela de login.
5. Para sair (logout), basta apagar o token no frontend.

Cada usuário vê e altera **somente os próprios dados**. Tentar acessar uma disciplina ou atividade de outra pessoa retorna `404`, como se ela não existisse. O nome de uma disciplina só precisa ser único dentro da conta do próprio usuário.

Exemplo em JavaScript:

```js
const resposta = await fetch("http://localhost:3000/api/atividades", {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Regras importantes para o frontend

- `disciplinaId` deve ser enviado como **número** (`1`), não como texto (`"1"`).
- `dataEntrega` deve estar no formato ISO em UTC, por exemplo `2026-11-30T23:59:00.000Z`. Em JavaScript: `new Date(valorDoCampo).toISOString()`.
- Valores aceitos:
  - `prioridade`: `BAIXA`, `MEDIA` (sem acento) ou `ALTA`
  - `status`: `PENDENTE`, `EM_ANDAMENTO` ou `CONCLUIDA`
- O frontend precisa rodar no endereço configurado em `FRONTEND_URL` no `.env` da API (por padrão `http://localhost:5173`), senão o navegador bloqueia as chamadas (CORS).
- As respostas de exclusão (`DELETE`) retornam status **204** e **não têm corpo**.

## Formato dos erros

Todos os erros seguem este padrão:

```json
{
  "erro": "CODIGO_DO_ERRO",
  "mensagem": "Texto explicando o problema.",
  "detalhes": []
}
```

Para erros de validação (400, `DADOS_INVALIDOS`), `detalhes` lista cada campo com problema:

```json
{
  "erro": "DADOS_INVALIDOS",
  "mensagem": "Os dados enviados não são válidos.",
  "detalhes": [
    { "campo": "titulo", "mensagem": "O título deve possuir pelo menos 3 caracteres." }
  ]
}
```

| Status | Quando acontece |
| --- | --- |
| 400 | Dados inválidos ou ID inválido |
| 401 | Sem token, token inválido/expirado, ou e-mail/senha incorretos no login |
| 404 | Disciplina, atividade ou rota não encontrada |
| 409 | Conflito (e-mail já cadastrado, nome de disciplina repetido ou disciplina com atividades) |
| 500 | Erro inesperado no servidor |

---

## Verificação da API

| Método | Rota | Resposta |
| --- | --- | --- |
| GET | `/api/saude` | `200` `{ "status": "API funcionando" }` |

---

## Autenticação: rotas

Estas duas rotas são **públicas** (não precisam de token).

### Criar conta
`POST /api/auth/cadastro`

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "123456"
}
```

- `nome`: de 2 a 100 caracteres.
- `email`: e-mail válido, **não pode repetir** (maiúsculas e minúsculas são tratadas como iguais).
- `senha`: de 6 a 72 caracteres. É guardada criptografada e nunca é devolvida pela API.
- Sucesso: `201`, já com o token (o usuário fica logado após o cadastro):

```json
{
  "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@email.com" },
  "token": "eyJhbGciOi..."
}
```

- Erros: `400 DADOS_INVALIDOS`, `409 EMAIL_JA_CADASTRADO`.

### Entrar (login)
`POST /api/auth/login`

```json
{
  "email": "maria@email.com",
  "senha": "123456"
}
```

- Sucesso: `200`, com o mesmo formato do cadastro (`usuario` e `token`).
- Erros: `400 DADOS_INVALIDOS`, `401 CREDENCIAIS_INVALIDAS` (a mensagem é a mesma para e-mail inexistente e senha errada, de propósito).

### Dados do usuário logado
`GET /api/auth/me` (exige token)

Útil para o frontend conferir se o token guardado ainda vale ao abrir o sistema.

- Sucesso: `200` com `{ "usuario": { "id", "nome", "email" } }`.
- Erros: `401 TOKEN_AUSENTE` ou `401 TOKEN_INVALIDO`.

### Erros de acesso nas rotas protegidas

| Status | Código | Quando |
| --- | --- | --- |
| 401 | `TOKEN_AUSENTE` | O cabeçalho `Authorization` não foi enviado |
| 401 | `TOKEN_INVALIDO` | Formato incorreto, token adulterado, expirado ou de usuário que não existe mais |

---

## Disciplinas

**Todas as rotas abaixo exigem token.**

Objeto disciplina:

```json
{
  "id": 1,
  "nome": "Banco de Dados",
  "usuarioId": 1,
  "createdAt": "2026-11-12T10:00:00.000Z",
  "updatedAt": "2026-11-12T10:00:00.000Z"
}
```

### Cadastrar disciplina
`POST /api/disciplinas`

```json
{ "nome": "Banco de Dados" }
```

- `nome`: obrigatório, de 2 a 100 caracteres, **não pode repetir dentro da conta do usuário**.
- Sucesso: `201` com a disciplina criada.
- Erros: `400 DADOS_INVALIDOS`, `409 DISCIPLINA_DUPLICADA`.

### Listar disciplinas
`GET /api/disciplinas`

- Sucesso: `200` com uma lista, em ordem alfabética. Cada item traz a quantidade de atividades:

```json
[
  {
    "id": 1,
    "nome": "Banco de Dados",
    "usuarioId": 1,
    "createdAt": "2026-11-12T10:00:00.000Z",
    "updatedAt": "2026-11-12T10:00:00.000Z",
    "_count": { "atividades": 3 }
  }
]
```

### Consultar disciplina
`GET /api/disciplinas/:id`

- Sucesso: `200` com a disciplina e a lista `atividades` dela (ordenadas por data de entrega).
- Erros: `400 ID_INVALIDO`, `404 DISCIPLINA_NAO_ENCONTRADA`.

### Editar disciplina
`PATCH /api/disciplinas/:id`

```json
{ "nome": "Engenharia de Software" }
```

- Sucesso: `200` com a disciplina atualizada.
- Erros: `400 DADOS_INVALIDOS`, `400 NENHUM_CAMPO_INFORMADO`, `404 DISCIPLINA_NAO_ENCONTRADA`, `409 DISCIPLINA_DUPLICADA`.

### Excluir disciplina
`DELETE /api/disciplinas/:id`

- Sucesso: `204` sem corpo.
- Erros: `404 DISCIPLINA_NAO_ENCONTRADA`, `409 DISCIPLINA_POSSUI_ATIVIDADES` (só é possível excluir disciplina sem atividades; `detalhes.quantidadeAtividades` informa quantas existem).

---

## Atividades

**Todas as rotas abaixo exigem token.**

Objeto atividade:

```json
{
  "id": 1,
  "titulo": "Trabalho de modelagem",
  "descricao": "Entregar o diagrama no portal",
  "dataEntrega": "2026-11-30T23:59:00.000Z",
  "prioridade": "ALTA",
  "status": "PENDENTE",
  "disciplinaId": 1,
  "usuarioId": 1,
  "createdAt": "2026-11-12T10:00:00.000Z",
  "updatedAt": "2026-11-12T10:00:00.000Z",
  "disciplina": {
    "id": 1,
    "nome": "Banco de Dados",
    "usuarioId": 1,
    "createdAt": "2026-11-12T10:00:00.000Z",
    "updatedAt": "2026-11-12T10:00:00.000Z"
  }
}
```

### Cadastrar atividade
`POST /api/atividades`

```json
{
  "titulo": "Trabalho de modelagem",
  "descricao": "Entregar o diagrama no portal",
  "disciplinaId": 1,
  "dataEntrega": "2026-11-30T23:59:00.000Z",
  "prioridade": "ALTA",
  "status": "PENDENTE"
}
```

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| `titulo` | Sim | 3 a 150 caracteres |
| `descricao` | Não | Até 1.000 caracteres (pode ser `null`) |
| `disciplinaId` | Sim | Número inteiro de uma disciplina existente **do próprio usuário** |
| `dataEntrega` | Sim | Data ISO em UTC |
| `prioridade` | Não | Padrão: `MEDIA` |
| `status` | Não | Padrão: `PENDENTE` |

- Sucesso: `201` com a atividade criada (incluindo `disciplina`).
- Erros: `400 DADOS_INVALIDOS`, `404 DISCIPLINA_NAO_ENCONTRADA`.

### Listar e filtrar atividades
`GET /api/atividades`

Todos os parâmetros são opcionais e podem ser combinados:

| Parâmetro | Valores | Padrão |
| --- | --- | --- |
| `disciplinaId` | número | sem filtro |
| `prioridade` | `BAIXA`, `MEDIA`, `ALTA` | sem filtro |
| `status` | `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA` | sem filtro |
| `ordenarPor` | `dataEntrega`, `titulo`, `prioridade`, `status`, `createdAt` | `dataEntrega` |
| `ordem` | `asc`, `desc` | `asc` |

Exemplo: `GET /api/atividades?prioridade=ALTA&status=PENDENTE&disciplinaId=1&ordenarPor=dataEntrega&ordem=asc`

Resposta `200`:

```json
{
  "quantidade": 1,
  "filtros": {
    "disciplinaId": 1,
    "prioridade": "ALTA",
    "status": "PENDENTE",
    "ordenarPor": "dataEntrega",
    "ordem": "asc"
  },
  "atividades": [ { "...": "objeto atividade" } ]
}
```

- Ao ordenar por `prioridade` ou `status`, a ordem segue a sequência dos valores (`BAIXA → MEDIA → ALTA`). Para mostrar as de prioridade alta primeiro, use `ordem=desc`.
- Erros: `400` com `ID_INVALIDO`, `PRIORIDADE_INVALIDA`, `STATUS_INVALIDO`, `ORDENACAO_INVALIDA` ou `DIRECAO_INVALIDA`.

### Consultar atividade
`GET /api/atividades/:id`

- Sucesso: `200` com a atividade (incluindo `disciplina`).
- Erros: `400 ID_INVALIDO`, `404 ATIVIDADE_NAO_ENCONTRADA`.

### Editar atividade
`PATCH /api/atividades/:id`

Envie **apenas** os campos que deseja alterar (os demais permanecem como estão):

```json
{ "status": "EM_ANDAMENTO" }
```

- Sucesso: `200` com a atividade atualizada.
- Erros: `400 DADOS_INVALIDOS`, `400 NENHUM_CAMPO_INFORMADO` (corpo vazio), `404 ATIVIDADE_NAO_ENCONTRADA`, `404 DISCIPLINA_NAO_ENCONTRADA`.

### Marcar atividade como concluída
`PATCH /api/atividades/:id/concluir`

Não precisa de corpo.

- Sucesso: `200`:

```json
{
  "mensagem": "Atividade marcada como concluída.",
  "atividade": { "...": "objeto atividade" }
}
```

- Erros: `400 ID_INVALIDO`, `404 ATIVIDADE_NAO_ENCONTRADA`.

### Excluir atividade
`DELETE /api/atividades/:id`

- Sucesso: `204` sem corpo.
- Erros: `400 ID_INVALIDO`, `404 ATIVIDADE_NAO_ENCONTRADA`.
