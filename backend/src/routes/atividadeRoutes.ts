import { Router } from "express";

import {
  concluirAtividade,
  consultarAtividade,
  criarAtividade,
  editarAtividade,
  excluirAtividade,
  listarAtividades
} from "../controllers/atividadeController.js";

export const atividadeRoutes = Router();

atividadeRoutes.post("/", criarAtividade);
atividadeRoutes.get("/", listarAtividades);
atividadeRoutes.get("/:id", consultarAtividade);
atividadeRoutes.patch("/:id", editarAtividade);
atividadeRoutes.patch("/:id/concluir", concluirAtividade);
atividadeRoutes.delete("/:id", excluirAtividade);