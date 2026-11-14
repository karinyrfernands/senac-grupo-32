import type {
  NextFunction,
  Request,
  Response
} from "express";

import { prisma } from "../database/prisma.js";
import { AppError } from "../utils/AppError.js";
import { verificarToken } from "../utils/jwt.js";

export async function autenticar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cabecalho = req.headers.authorization;

    if (!cabecalho) {
      throw new AppError(
        "Token de acesso não informado. Faça login.",
        401,
        "TOKEN_AUSENTE"
      );
    }

    const [tipo, token] = cabecalho.split(" ");

    if (tipo.toLowerCase() !== "bearer" || !token) {
      throw new AppError(
        "Formato do token inválido. Envie o cabeçalho Authorization: Bearer <token>.",
        401,
        "TOKEN_INVALIDO"
      );
    }

    const usuarioId = verificarToken(token);

    if (usuarioId === null) {
      throw new AppError(
        "Token inválido ou expirado. Faça login novamente.",
        401,
        "TOKEN_INVALIDO"
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId
      },
      select: {
        id: true
      }
    });

    if (!usuario) {
      throw new AppError(
        "Token inválido ou expirado. Faça login novamente.",
        401,
        "TOKEN_INVALIDO"
      );
    }

    res.locals.usuarioId = usuario.id;

    next();
  } catch (erro) {
    next(erro);
  }
}

// Usado pelos controllers para saber quem está logado.
export function obterUsuarioId(res: Response): number {
  return res.locals.usuarioId as number;
}
