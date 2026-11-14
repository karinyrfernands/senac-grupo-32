import type {
  NextFunction,
  Request,
  Response
} from "express";

import { prisma } from "../database/prisma.js";
import { obterUsuarioId } from "../middlewares/autenticar.js";
import {
  criarAtividadeSchema,
  editarAtividadeSchema
} from "../schemas/atividadeSchema.js";
import { AppError } from "../utils/AppError.js";

const prioridadesValidas = [
  "BAIXA",
  "MEDIA",
  "ALTA"
] as const;

const statusValidos = [
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONCLUIDA"
] as const;

type Prioridade = (typeof prioridadesValidas)[number];
type StatusAtividade = (typeof statusValidos)[number];

function obterId(valor: string): number {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(
      "O ID informado é inválido.",
      400,
      "ID_INVALIDO"
    );
  }

  return id;
}

function prioridadeValida(
  valor: string
): valor is Prioridade {
  return prioridadesValidas.includes(
    valor as Prioridade
  );
}

function statusValido(
  valor: string
): valor is StatusAtividade {
  return statusValidos.includes(
    valor as StatusAtividade
  );
}

// A disciplina precisa existir E pertencer ao usuário logado.
async function verificarDisciplina(
  disciplinaId: number,
  usuarioId: number
) {
  const disciplina = await prisma.disciplina.findFirst({
    where: {
      id: disciplinaId,
      usuarioId
    }
  });

  if (!disciplina) {
    throw new AppError(
      "A disciplina informada não foi encontrada.",
      404,
      "DISCIPLINA_NAO_ENCONTRADA"
    );
  }
}

export async function criarAtividade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const dados = criarAtividadeSchema.parse(req.body);

    await verificarDisciplina(dados.disciplinaId, usuarioId);

    const atividade = await prisma.atividade.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao ?? null,
        disciplinaId: dados.disciplinaId,
        usuarioId,
        dataEntrega: new Date(dados.dataEntrega),
        prioridade: dados.prioridade,
        status: dados.status
      },
      include: {
        disciplina: true
      }
    });

    return res.status(201).json(atividade);
  } catch (erro) {
    next(erro);
  }
}

export async function listarAtividades(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);

    const {
      disciplinaId,
      prioridade,
      status,
      ordenarPor = "dataEntrega",
      ordem = "asc"
    } = req.query;

    let disciplinaFiltro: number | undefined;

    if (disciplinaId !== undefined) {
      disciplinaFiltro = obterId(
        String(disciplinaId)
      );
    }

    let prioridadeFiltro: Prioridade | undefined;

    if (prioridade !== undefined) {
      const valor = String(prioridade).toUpperCase();

      if (!prioridadeValida(valor)) {
        throw new AppError(
          "A prioridade deve ser BAIXA, MEDIA ou ALTA.",
          400,
          "PRIORIDADE_INVALIDA"
        );
      }

      prioridadeFiltro = valor;
    }

    let statusFiltro: StatusAtividade | undefined;

    if (status !== undefined) {
      const valor = String(status).toUpperCase();

      if (!statusValido(valor)) {
        throw new AppError(
          "O status deve ser PENDENTE, EM_ANDAMENTO ou CONCLUIDA.",
          400,
          "STATUS_INVALIDO"
        );
      }

      statusFiltro = valor;
    }

    const camposOrdenacao = [
      "dataEntrega",
      "titulo",
      "prioridade",
      "status",
      "createdAt"
    ];

    const campoOrdenacao = String(ordenarPor);

    if (!camposOrdenacao.includes(campoOrdenacao)) {
      throw new AppError(
        "O campo de ordenação informado é inválido.",
        400,
        "ORDENACAO_INVALIDA"
      );
    }

    const direcao = String(ordem).toLowerCase();

    if (direcao !== "asc" && direcao !== "desc") {
      throw new AppError(
        "A ordem deve ser asc ou desc.",
        400,
        "DIRECAO_INVALIDA"
      );
    }

    const atividades = await prisma.atividade.findMany({
      where: {
        usuarioId,
        disciplinaId: disciplinaFiltro,
        prioridade: prioridadeFiltro,
        status: statusFiltro
      },
      include: {
        disciplina: true
      },
      orderBy: {
        [campoOrdenacao]: direcao
      }
    });

    return res.status(200).json({
      quantidade: atividades.length,
      filtros: {
        disciplinaId: disciplinaFiltro ?? null,
        prioridade: prioridadeFiltro ?? null,
        status: statusFiltro ?? null,
        ordenarPor: campoOrdenacao,
        ordem: direcao
      },
      atividades
    });
  } catch (erro) {
    next(erro);
  }
}

export async function consultarAtividade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));

    const atividade = await prisma.atividade.findFirst({
      where: {
        id,
        usuarioId
      },
      include: {
        disciplina: true
      }
    });

    if (!atividade) {
      throw new AppError(
        "A atividade informada não foi encontrada.",
        404,
        "ATIVIDADE_NAO_ENCONTRADA"
      );
    }

    return res.status(200).json(atividade);
  } catch (erro) {
    next(erro);
  }
}

export async function editarAtividade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));
    const dados = editarAtividadeSchema.parse(req.body);

    if (Object.keys(dados).length === 0) {
      throw new AppError(
        "Informe pelo menos um campo para alteração.",
        400,
        "NENHUM_CAMPO_INFORMADO"
      );
    }

    const atividadeAtual =
      await prisma.atividade.findFirst({
        where: {
          id,
          usuarioId
        }
      });

    if (!atividadeAtual) {
      throw new AppError(
        "A atividade informada não foi encontrada.",
        404,
        "ATIVIDADE_NAO_ENCONTRADA"
      );
    }

    if (dados.disciplinaId !== undefined) {
      await verificarDisciplina(dados.disciplinaId, usuarioId);
    }

    const atividadeAtualizada =
      await prisma.atividade.update({
        where: {
          id
        },
        data: {
          titulo: dados.titulo,
          descricao: dados.descricao,
          disciplinaId: dados.disciplinaId,
          dataEntrega:
            dados.dataEntrega !== undefined
              ? new Date(dados.dataEntrega)
              : undefined,
          prioridade: dados.prioridade,
          status: dados.status
        },
        include: {
          disciplina: true
        }
      });

    return res.status(200).json(atividadeAtualizada);
  } catch (erro) {
    next(erro);
  }
}

export async function concluirAtividade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));

    const atividade = await prisma.atividade.findFirst({
      where: {
        id,
        usuarioId
      }
    });

    if (!atividade) {
      throw new AppError(
        "A atividade informada não foi encontrada.",
        404,
        "ATIVIDADE_NAO_ENCONTRADA"
      );
    }

    const atividadeConcluida =
      await prisma.atividade.update({
        where: {
          id
        },
        data: {
          status: "CONCLUIDA"
        },
        include: {
          disciplina: true
        }
      });

    return res.status(200).json({
      mensagem: "Atividade marcada como concluída.",
      atividade: atividadeConcluida
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirAtividade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));

    const atividade = await prisma.atividade.findFirst({
      where: {
        id,
        usuarioId
      }
    });

    if (!atividade) {
      throw new AppError(
        "A atividade informada não foi encontrada.",
        404,
        "ATIVIDADE_NAO_ENCONTRADA"
      );
    }

    await prisma.atividade.delete({
      where: {
        id
      }
    });

    return res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
