// ============================================================
// api.js — Camada de comunicação com o backend (http://localhost:3000)
// Centraliza o token, o cabeçalho Authorization e o tratamento de erros.
// ============================================================

const BASE_URL = "http://localhost:3000";
const CHAVE_TOKEN = "senac32_token";

// ---------- Token (guardado no localStorage) ----------
export const token = {
  obter: () => localStorage.getItem(CHAVE_TOKEN),
  salvar: (valor) => localStorage.setItem(CHAVE_TOKEN, valor),
  apagar: () => localStorage.removeItem(CHAVE_TOKEN),
};

// Erro padronizado que carrega os dados vindos da API.
export class ErroApi extends Error {
  constructor(mensagem, status, codigo, detalhes) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes || [];
  }
}

// ---------- Requisição genérica ----------
async function requisitar(caminho, { metodo = "GET", corpo, autenticar = true } = {}) {
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (autenticar) {
    const t = token.obter();
    if (t) cabecalhos["Authorization"] = `Bearer ${t}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    // fetch só lança em falha de rede/CORS — a API provavelmente está desligada.
    throw new ErroApi(
      "Não foi possível falar com o servidor. Verifique se a API está rodando em http://localhost:3000.",
      0,
      "SEM_CONEXAO"
    );
  }

  // 204 (ex.: DELETE) não tem corpo.
  if (resposta.status === 204) return null;

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const msg = (dados && dados.mensagem) || "Ocorreu um erro inesperado.";
    throw new ErroApi(msg, resposta.status, dados && dados.erro, dados && dados.detalhes);
  }

  return dados;
}

// ---------- Autenticação ----------
export const auth = {
  cadastrar: (nome, email, senha) =>
    requisitar("/api/auth/cadastro", { metodo: "POST", corpo: { nome, email, senha }, autenticar: false }),
  login: (email, senha) =>
    requisitar("/api/auth/login", { metodo: "POST", corpo: { email, senha }, autenticar: false }),
  eu: () => requisitar("/api/auth/me"),
};

// ---------- Disciplinas ----------
export const disciplinas = {
  listar: () => requisitar("/api/disciplinas"),
  criar: (nome) => requisitar("/api/disciplinas", { metodo: "POST", corpo: { nome } }),
  editar: (id, nome) => requisitar(`/api/disciplinas/${id}`, { metodo: "PATCH", corpo: { nome } }),
  excluir: (id) => requisitar(`/api/disciplinas/${id}`, { metodo: "DELETE" }),
};

// ---------- Atividades ----------
export const atividades = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor !== "" && valor !== undefined && valor !== null) params.append(chave, valor);
    }
    const query = params.toString();
    return requisitar(`/api/atividades${query ? "?" + query : ""}`);
  },
  criar: (dados) => requisitar("/api/atividades", { metodo: "POST", corpo: dados }),
  editar: (id, dados) => requisitar(`/api/atividades/${id}`, { metodo: "PATCH", corpo: dados }),
  concluir: (id) => requisitar(`/api/atividades/${id}/concluir`, { metodo: "PATCH" }),
  excluir: (id) => requisitar(`/api/atividades/${id}`, { metodo: "DELETE" }),
};
