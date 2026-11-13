import { z } from "zod";

const prioridadesValidas = ["BAIXA", "MEDIA", "ALTA"] as const;

const statusValidos = [
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONCLUIDA"
] as const;

const dataEntregaSchema = z
  .string({
    message: "A data de entrega deve ser informada."
  })
  .datetime({
    message:
      "A data de entrega deve estar no formato ISO, como 2026-11-30T23:59:00.000Z."
  });

// Campos da atividade SEM valores padrão.
// Servem de base tanto para criar quanto para editar.
const camposAtividadeSchema = z.object({
  titulo: z
    .string({
      message: "O título deve ser informado."
    })
    .trim()
    .min(3, "O título deve possuir pelo menos 3 caracteres.")
    .max(150, "O título deve possuir no máximo 150 caracteres."),

  descricao: z
    .string()
    .trim()
    .max(1000, "A descrição deve possuir no máximo 1.000 caracteres.")
    .nullable(),

  disciplinaId: z
    .number({
      message: "O ID da disciplina deve ser um número."
    })
    .int("O ID da disciplina deve ser um número inteiro.")
    .positive("O ID da disciplina deve ser maior que zero."),

  dataEntrega: dataEntregaSchema,

  prioridade: z.enum(prioridadesValidas, {
    message: "A prioridade deve ser BAIXA, MEDIA ou ALTA."
  }),

  status: z.enum(statusValidos, {
    message: "O status deve ser PENDENTE, EM_ANDAMENTO ou CONCLUIDA."
  })
});

// CRIAR: prioridade e status têm valor padrão (MEDIA e PENDENTE).
export const criarAtividadeSchema = camposAtividadeSchema
  .extend({
    descricao: camposAtividadeSchema.shape.descricao.optional(),
    prioridade: camposAtividadeSchema.shape.prioridade.default("MEDIA"),
    status: camposAtividadeSchema.shape.status.default("PENDENTE")
  });

// EDITAR: todos os campos são opcionais e NÃO têm valor padrão.
// Assim, só muda o que for enviado no Body.
export const editarAtividadeSchema = camposAtividadeSchema.partial();
