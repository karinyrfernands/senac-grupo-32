import type {
  NextFunction,
  Request,
  Response
} from "express";

import { prisma } from "../database/prisma.js";
import { obterUsuarioId } from "../middlewares/autenticar.js";
import {
  criarDisciplinaSchema,
  editarDisciplinaSchema
} from "../schemas/disciplinaSchema.js";
import { AppError } from "../utils/AppError.js";

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

export async function criarDisciplina(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const dados = criarDisciplinaSchema.parse(req.body);

    const disciplinaExistente =
      await prisma.disciplina.findFirst({
        where: {
          nome: dados.nome,
          usuarioId
        }
      });

    if (disciplinaExistente) {
      throw new AppError(
        "Já existe uma disciplina com esse nome.",
        409,
        "DISCIPLINA_DUPLICADA"
      );
    }

    const disciplina = await prisma.disciplina.create({
      data: {
        nome: dados.nome,
        usuarioId
      }
    });

    return res.status(201).json(disciplina);
  } catch (erro) {
    next(erro);
  }
}

export async function listarDisciplinas(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);

    const disciplinas = await prisma.disciplina.findMany({
      where: {
        usuarioId
      },
      orderBy: {
        nome: "asc"
      },
      include: {
        _count: {
          select: {
            atividades: true
          }
        }
      }
    });

    return res.status(200).json(disciplinas);
  } catch (erro) {
    next(erro);
  }
}

export async function consultarDisciplina(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));

    const disciplina = await prisma.disciplina.findFirst({
      where: {
        id,
        usuarioId
      },
      include: {
        atividades: {
          orderBy: {
            dataEntrega: "asc"
          }
        }
      }
    });

    if (!disciplina) {
      throw new AppError(
        "A disciplina informada não foi encontrada.",
        404,
        "DISCIPLINA_NAO_ENCONTRADA"
      );
    }

    return res.status(200).json(disciplina);
  } catch (erro) {
    next(erro);
  }
}

export async function editarDisciplina(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));
    const dados = editarDisciplinaSchema.parse(req.body);

    if (!dados.nome) {
      throw new AppError(
        "Informe o nome que será alterado.",
        400,
        "NENHUM_CAMPO_INFORMADO"
      );
    }

    const disciplinaAtual =
      await prisma.disciplina.findFirst({
        where: {
          id,
          usuarioId
        }
      });

    if (!disciplinaAtual) {
      throw new AppError(
        "A disciplina informada não foi encontrada.",
        404,
        "DISCIPLINA_NAO_ENCONTRADA"
      );
    }

    const disciplinaComMesmoNome =
      await prisma.disciplina.findFirst({
        where: {
          nome: dados.nome,
          usuarioId,
          id: {
            not: id
          }
        }
      });

    if (disciplinaComMesmoNome) {
      throw new AppError(
        "Já existe outra disciplina com esse nome.",
        409,
        "DISCIPLINA_DUPLICADA"
      );
    }

    const disciplinaAtualizada =
      await prisma.disciplina.update({
        where: {
          id
        },
        data: {
          nome: dados.nome
        }
      });

    return res.status(200).json(disciplinaAtualizada);
  } catch (erro) {
    next(erro);
  }
}

export async function excluirDisciplina(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuarioId = obterUsuarioId(res);
    const id = obterId(String(req.params.id));

    const disciplina = await prisma.disciplina.findFirst({
      where: {
        id,
        usuarioId
      },
      include: {
        _count: {
          select: {
            atividades: true
          }
        }
      }
    });

    if (!disciplina) {
      throw new AppError(
        "A disciplina informada não foi encontrada.",
        404,
        "DISCIPLINA_NAO_ENCONTRADA"
      );
    }

    if (disciplina._count.atividades > 0) {
      throw new AppError(
        "A disciplina não pode ser excluída porque possui atividades cadastradas.",
        409,
        "DISCIPLINA_POSSUI_ATIVIDADES",
        {
          quantidadeAtividades:
            disciplina._count.atividades
        }
      );
    }

    await prisma.disciplina.delete({
      where: {
        id
      }
    });

    return res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}
