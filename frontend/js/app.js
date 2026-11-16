// ============================================================
// app.js — Controla a interface: login, disciplinas, atividades,
// filtros e as ações de editar / excluir / concluir.
// ============================================================

import { token, auth, disciplinas, atividades, ErroApi } from "./api.js";

// Atalhos para selecionar elementos.
const $ = (sel) => document.querySelector(sel);

// Cache das disciplinas do usuário (usado nos selects).
let disciplinasCache = [];

// ------------------------------------------------------------
// Utilidades de interface
// ------------------------------------------------------------
let toastTimer;
function mostrarToast(mensagem, tipo = "") {
  const el = $("#toast");
  el.textContent = mensagem;
  el.className = `toast visivel ${tipo}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = "toast"), 3500);
}

// Traduz um erro da API em mensagem amigável. Se for 401, desloga.
function tratarErro(erro) {
  if (erro instanceof ErroApi) {
    if (erro.status === 401 && token.obter()) {
      token.apagar();
      mostrarApp(false);
      mostrarToast("Sua sessão expirou. Entre novamente.", "erro");
      return;
    }
    // Erros de validação trazem detalhes por campo.
    if (erro.detalhes && erro.detalhes.length) {
      mostrarToast(erro.detalhes.map((d) => d.mensagem).join(" "), "erro");
      return;
    }
    mostrarToast(erro.mensagem, "erro");
    return;
  }
  mostrarToast("Erro inesperado.", "erro");
  console.error(erro);
}

// Rótulos legíveis.
const ROTULO_PRIORIDADE = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta" };
const ROTULO_STATUS = { PENDENTE: "Pendente", EM_ANDAMENTO: "Em andamento", CONCLUIDA: "Concluída" };

// Formata uma data ISO para o padrão brasileiro.
function formatarData(iso) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// Converte um valor de <input datetime-local> em ISO UTC (exigido pela API).
function paraIsoUtc(valorLocal) {
  return new Date(valorLocal).toISOString();
}

// Converte um ISO UTC para o formato aceito pelo <input datetime-local> (hora local).
function paraInputLocal(iso) {
  const d = new Date(iso);
  const ajustada = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return ajustada.toISOString().slice(0, 16);
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

// ------------------------------------------------------------
// Alternância entre tela de login e aplicação
// ------------------------------------------------------------
function mostrarApp(logado) {
  $("#tela-auth").classList.toggle("oculto", logado);
  $("#tela-app").classList.toggle("oculto", !logado);
}

// ------------------------------------------------------------
// Autenticação
// ------------------------------------------------------------
function configurarAbas() {
  document.querySelectorAll(".aba").forEach((aba) => {
    aba.addEventListener("click", () => {
      document.querySelectorAll(".aba").forEach((a) => a.classList.remove("ativa"));
      aba.classList.add("ativa");
      const alvo = aba.dataset.aba;
      $("#form-login").classList.toggle("oculto", alvo !== "login");
      $("#form-cadastro").classList.toggle("oculto", alvo !== "cadastro");
    });
  });
}

function aoEntrar(sessao) {
  token.salvar(sessao.token);
  $("#nome-usuario").textContent = sessao.usuario.nome;
  mostrarApp(true);
  carregarTudo();
}

$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    const sessao = await auth.login(f.email.value, f.senha.value);
    aoEntrar(sessao);
    f.reset();
  } catch (erro) {
    tratarErro(erro);
  }
});

$("#form-cadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    const sessao = await auth.cadastrar(f.nome.value, f.email.value, f.senha.value);
    aoEntrar(sessao);
    f.reset();
    mostrarToast("Conta criada com sucesso!", "sucesso");
  } catch (erro) {
    tratarErro(erro);
  }
});

$("#btn-sair").addEventListener("click", () => {
  token.apagar();
  mostrarApp(false);
  mostrarToast("Você saiu da conta.");
});

// ------------------------------------------------------------
// Disciplinas
// ------------------------------------------------------------
async function carregarDisciplinas() {
  disciplinasCache = await disciplinas.listar();
  renderizarDisciplinas();
  preencherSelectsDisciplina();
}

function renderizarDisciplinas() {
  const ul = $("#lista-disciplinas");
  if (!disciplinasCache.length) {
    ul.innerHTML = `<li class="vazio">Nenhuma disciplina. Adicione uma para começar.</li>`;
    return;
  }
  ul.innerHTML = disciplinasCache
    .map(
      (d) => `
      <li>
        <span>${escapar(d.nome)}</span>
        <span class="contagem">(${d._count ? d._count.atividades : 0})</span>
        <button class="disciplina-excluir" data-excluir-disciplina="${d.id}" title="Excluir disciplina">✕</button>
      </li>`
    )
    .join("");
}

function preencherSelectsDisciplina() {
  const opcoes =
    `<option value="">Selecione...</option>` +
    disciplinasCache.map((d) => `<option value="${d.id}">${escapar(d.nome)}</option>`).join("");
  // Select do formulário de atividade.
  $('#form-atividade select[name="disciplinaId"]').innerHTML = opcoes;
  // Select de filtro (com opção "Todas").
  const filtro = $("#filtro-disciplina");
  const valorAtual = filtro.value;
  filtro.innerHTML =
    `<option value="">Todas</option>` +
    disciplinasCache.map((d) => `<option value="${d.id}">${escapar(d.nome)}</option>`).join("");
  filtro.value = valorAtual;
}

$("#form-disciplina").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("#input-disciplina");
  try {
    await disciplinas.criar(input.value.trim());
    input.value = "";
    await carregarDisciplinas();
    mostrarToast("Disciplina adicionada.", "sucesso");
  } catch (erro) {
    tratarErro(erro);
  }
});

$("#lista-disciplinas").addEventListener("click", async (e) => {
  const botao = e.target.closest("[data-excluir-disciplina]");
  if (!botao) return;
  const id = botao.dataset.excluirDisciplina;
  if (!confirm("Excluir esta disciplina? (Só é possível se ela não tiver atividades.)")) return;
  try {
    await disciplinas.excluir(id);
    await carregarDisciplinas();
    await carregarAtividades();
    mostrarToast("Disciplina excluída.", "sucesso");
  } catch (erro) {
    tratarErro(erro);
  }
});

// ------------------------------------------------------------
// Atividades — listagem e filtros
// ------------------------------------------------------------
function filtrosAtuais() {
  return {
    disciplinaId: $("#filtro-disciplina").value,
    prioridade: $("#filtro-prioridade").value,
    status: $("#filtro-status").value,
    ordenarPor: $("#filtro-ordenar").value,
    ordem: $("#filtro-ordem").value,
  };
}

async function carregarAtividades() {
  const lista = $("#lista-atividades");
  lista.innerHTML = `<p class="vazio">Carregando...</p>`;
  try {
    const resultado = await atividades.listar(filtrosAtuais());
    renderizarAtividades(resultado.atividades, resultado.quantidade);
  } catch (erro) {
    lista.innerHTML = "";
    tratarErro(erro);
  }
}

function renderizarAtividades(lista, quantidade) {
  $("#contador-atividades").textContent =
    quantidade === 0 ? "Nenhuma atividade encontrada." : `${quantidade} atividade(s) encontrada(s).`;

  const container = $("#lista-atividades");
  if (!lista.length) {
    container.innerHTML = `<p class="vazio">Nenhuma atividade. Clique em "Nova atividade" para cadastrar.</p>`;
    return;
  }

  const agora = Date.now();
  container.innerHTML = lista
    .map((a) => {
      const concluida = a.status === "CONCLUIDA";
      const atrasada = !concluida && new Date(a.dataEntrega).getTime() < agora;
      return `
      <article class="cartao prio-${a.prioridade} ${concluida ? "concluida" : ""}">
        <div class="cartao-topo">
          <div>
            <div class="cartao-titulo">${escapar(a.titulo)}</div>
            ${a.descricao ? `<div class="cartao-descricao">${escapar(a.descricao)}</div>` : ""}
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            <span class="selo selo-prio-${a.prioridade}">${ROTULO_PRIORIDADE[a.prioridade]}</span>
            <span class="selo selo-status-${a.status}">${ROTULO_STATUS[a.status]}</span>
          </div>
        </div>
        <div class="cartao-meta">
          <span class="selo selo-disciplina">${escapar(a.disciplina ? a.disciplina.nome : "")}</span>
          <span class="cartao-prazo ${atrasada ? "atrasada" : ""}">
            📅 ${formatarData(a.dataEntrega)}${atrasada ? " (atrasada)" : ""}
          </span>
        </div>
        <div class="cartao-acoes">
          ${concluida ? "" : `<button class="btn btn-concluir" data-concluir="${a.id}">✔ Concluir</button>`}
          <button class="btn btn-editar" data-editar="${a.id}">✎ Editar</button>
          <button class="btn btn-excluir" data-excluir="${a.id}">🗑 Excluir</button>
        </div>
      </article>`;
    })
    .join("");
}

// Reage a qualquer mudança nos filtros.
["#filtro-disciplina", "#filtro-prioridade", "#filtro-status", "#filtro-ordenar", "#filtro-ordem"].forEach((sel) =>
  $(sel).addEventListener("change", carregarAtividades)
);

$("#btn-limpar-filtros").addEventListener("click", () => {
  $("#filtro-disciplina").value = "";
  $("#filtro-prioridade").value = "";
  $("#filtro-status").value = "";
  $("#filtro-ordenar").value = "dataEntrega";
  $("#filtro-ordem").value = "asc";
  carregarAtividades();
});

// Ações nos cartões (concluir / editar / excluir).
$("#lista-atividades").addEventListener("click", async (e) => {
  const concluir = e.target.closest("[data-concluir]");
  const editar = e.target.closest("[data-editar]");
  const excluir = e.target.closest("[data-excluir]");

  try {
    if (concluir) {
      await atividades.concluir(concluir.dataset.concluir);
      await carregarAtividades();
      await carregarDisciplinas();
      mostrarToast("Atividade concluída!", "sucesso");
    } else if (editar) {
      abrirModalEdicao(editar.dataset.editar);
    } else if (excluir) {
      if (!confirm("Excluir esta atividade?")) return;
      await atividades.excluir(excluir.dataset.excluir);
      await carregarAtividades();
      await carregarDisciplinas();
      mostrarToast("Atividade excluída.", "sucesso");
    }
  } catch (erro) {
    tratarErro(erro);
  }
});

// ------------------------------------------------------------
// Modal de atividade (criar / editar)
// ------------------------------------------------------------
const modal = $("#modal-atividade");
const formAtividade = $("#form-atividade");

function abrirModal() {
  if (!disciplinasCache.length) {
    mostrarToast("Crie uma disciplina antes de cadastrar atividades.", "erro");
    return;
  }
  modal.classList.remove("oculto");
}
function fecharModal() {
  modal.classList.add("oculto");
  formAtividade.reset();
}

$("#btn-nova-atividade").addEventListener("click", () => {
  formAtividade.reset();
  formAtividade.id.value = "";
  $("#modal-titulo").textContent = "Nova atividade";
  abrirModal();
});

// Buscar a atividade na lista atual para preencher o formulário de edição.
async function abrirModalEdicao(id) {
  try {
    const resultado = await atividades.listar(filtrosAtuais());
    const a = resultado.atividades.find((x) => String(x.id) === String(id));
    if (!a) return mostrarToast("Atividade não encontrada.", "erro");

    $("#modal-titulo").textContent = "Editar atividade";
    formAtividade.id.value = a.id;
    formAtividade.titulo.value = a.titulo;
    formAtividade.descricao.value = a.descricao || "";
    formAtividade.disciplinaId.value = a.disciplinaId;
    formAtividade.dataEntrega.value = paraInputLocal(a.dataEntrega);
    formAtividade.prioridade.value = a.prioridade;
    formAtividade.status.value = a.status;
    abrirModal();
  } catch (erro) {
    tratarErro(erro);
  }
}

// Fechar modal (botões e clique no fundo).
document.querySelectorAll("[data-fechar-modal]").forEach((b) => b.addEventListener("click", fecharModal));
modal.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});

// Salvar (criar ou editar).
formAtividade.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const dados = {
    titulo: f.titulo.value.trim(),
    descricao: f.descricao.value.trim() || null,
    disciplinaId: Number(f.disciplinaId.value), // a API exige número
    dataEntrega: paraIsoUtc(f.dataEntrega.value),
    prioridade: f.prioridade.value,
    status: f.status.value,
  };
  try {
    if (f.id.value) {
      await atividades.editar(f.id.value, dados);
      mostrarToast("Atividade atualizada.", "sucesso");
    } else {
      await atividades.criar(dados);
      mostrarToast("Atividade cadastrada!", "sucesso");
    }
    fecharModal();
    await carregarAtividades();
    await carregarDisciplinas();
  } catch (erro) {
    tratarErro(erro);
  }
});

// ------------------------------------------------------------
// Inicialização
// ------------------------------------------------------------
async function carregarTudo() {
  await carregarDisciplinas();
  await carregarAtividades();
}

async function iniciar() {
  configurarAbas();
  // Se já existe token guardado, tenta validar e entrar direto.
  if (token.obter()) {
    try {
      const { usuario } = await auth.eu();
      $("#nome-usuario").textContent = usuario.nome;
      mostrarApp(true);
      await carregarTudo();
      return;
    } catch {
      token.apagar();
    }
  }
  mostrarApp(false);
}

iniciar();
