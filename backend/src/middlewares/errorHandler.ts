import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response
} from "express";

import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const errorHandler: ErrorRequestHandler = (
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (erro instanceof ZodError) {
    const detalhes = erro.issues.map((issue) => ({
      campo: issue.path.join("."),
      mensagem: issue.message
    }));

    res.status(400).json({
      erro: "DADOS_INVALIDOS",
      mensagem: "Os dados enviados não são válidos.",
      detalhes
    });

    return;
  }

  if (erro instanceof AppError) {
    res.status(erro.statusCode).json({
      erro: erro.codigo,
      mensagem: erro.message,
      detalhes: erro.detalhes
    });

    return;
  }

  console.error("Erro inesperado:", erro);

  res.status(500).json({
    erro: "ERRO_INTERNO",
    mensagem: "Ocorreu um erro inesperado no servidor."
  });
};