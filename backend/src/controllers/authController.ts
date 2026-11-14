import type {
  NextFunction,
  Request,
  Response
} from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../database/prisma.js";
import { obterUsuarioId } from "../middlewares/autenticar.js";
import {
  cadastroSchema,
  loginSchema
} from "../schemas/authSchema.js";
import { AppError } from "../utils/AppError.js";
import { gerarToken } from "../utils/jwt.js";

// Dados do usuário que podem ser enviados ao frontend (nunca a senha).
const dadosPublicos = {
  id: true,
  nome: true,
  email: true
} as const;

export async function cadastrar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dados = cadastroSchema.parse(req.body);

    const emailExistente = await prisma.usuario.findUnique({
      where: {
        email: dados.email
      },
      select: {
        id: true
      }
    });

    if (emailExistente) {
      throw new AppError(
        "Já existe um usuário cadastrado com esse e-mail.",
        409,
        "EMAIL_JA_CADASTRADO"
      );
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senhaHash
      },
      select: dadosPublicos
    });

    const token = gerarToken(usuario.id);

    return res.status(201).json({
      usuario,
      token
    });
  } catch (erro) {
    next(erro);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dados = loginSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: {
        email: dados.email
      }
    });

    const senhaCorreta = usuario
      ? await bcrypt.compare(dados.senha, usuario.senhaHash)
      : false;

    // A mesma mensagem para "e-mail não existe" e "senha errada",
    // para não revelar quais e-mails estão cadastrados.
    if (!usuario || !senhaCorreta) {
      throw new AppError(
        "E-mail ou senha incorretos.",
        401,
        "CREDENCIAIS_INVALIDAS"
      );
    }

    const token = gerarToken(usuario.id);

    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });
  } catch (erro) {
    next(erro);
  }
}

export async function perfil(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: obterUsuarioId(res)
      },
      select: dadosPublicos
    });

    return res.status(200).json({
      usuario
    });
  } catch (erro) {
    next(erro);
  }
}
