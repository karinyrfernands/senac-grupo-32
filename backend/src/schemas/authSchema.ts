import { z } from "zod";

const emailSchema = z
  .string({
    message: "O e-mail deve ser informado."
  })
  .trim()
  .toLowerCase()
  .max(150, "O e-mail deve possuir no máximo 150 caracteres.")
  .email("Informe um e-mail válido.");

export const cadastroSchema = z.object({
  nome: z
    .string({
      message: "O nome deve ser informado."
    })
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres.")
    .max(100, "O nome deve possuir no máximo 100 caracteres."),

  email: emailSchema,

  senha: z
    .string({
      message: "A senha deve ser informada."
    })
    .min(6, "A senha deve possuir pelo menos 6 caracteres.")
    .max(72, "A senha deve possuir no máximo 72 caracteres.")
});

export const loginSchema = z.object({
  email: emailSchema,

  senha: z
    .string({
      message: "A senha deve ser informada."
    })
    .min(1, "A senha deve ser informada.")
});
