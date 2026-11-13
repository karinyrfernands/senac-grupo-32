import { z } from "zod";

export const criarDisciplinaSchema = z.object({
  nome: z
    .string({
      message: "O nome da disciplina deve ser informado."
    })
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres.")
});

export const editarDisciplinaSchema = criarDisciplinaSchema.partial();