# Frontend — SENAC Grupo 32

Interface web do sistema de gerenciamento de atividades acadêmicas.
Feito em **HTML5, CSS3 e JavaScript puro** (sem frameworks).

## Funcionalidades (Etapa 3)

- Tela de **login e cadastro** de usuário (a API exige autenticação).
- **Interface principal** (dashboard) após o login.
- Cadastro, listagem e gerenciamento de **disciplinas**.
- **Formulário de cadastro de atividades** (título, descrição, disciplina, data de entrega, prioridade e status).
- **Listagem de atividades** em cartões, com destaque de prioridade e aviso de prazo atrasado.
- **Filtros** por disciplina, prioridade e status, além de ordenação.
- Botões de **editar, excluir e concluir** cada atividade.
- Layout **responsivo** (adaptado para celular).

## Pré-requisitos

1. O **backend** precisa estar rodando em `http://localhost:3000`
   (veja as instruções na pasta `backend/`).
2. O frontend **precisa** ser aberto em `http://localhost:5173`, senão o
   navegador bloqueia as chamadas por causa do CORS. **Não** abra o
   `index.html` com duplo-clique (`file://`) — use um servidor local.

## Como executar

Escolha **uma** das opções abaixo (todas servem na porta 5173):

### Opção A — Node.js (recomendada)
```bash
cd frontend
npm start
```
Depois abra: http://localhost:5173

### Opção B — Python
```bash
cd frontend
python -m http.server 5173
```

### Opção C — Extensão do VS Code
Se usar a extensão **Live Server**, configure a porta para `5173`
(em *Settings → Live Server › Port*) e clique em "Go Live".

## Estrutura

```
frontend/
├── index.html        → telas (login + aplicação) e modal de atividade
├── css/
│   └── style.css      → estilos e responsividade
└── js/
    ├── api.js         → comunicação com a API e controle do token
    └── app.js         → lógica da interface e eventos
```

## Observações

- O token de login fica guardado no `localStorage` do navegador. Ao reabrir o
  site, o usuário continua logado até o token expirar (7 dias) ou clicar em "Sair".
- As datas são enviadas à API em formato ISO (UTC), como exigido na documentação.
