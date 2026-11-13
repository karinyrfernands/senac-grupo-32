import { Router } from "express";

import {
  consultarDisciplina,
  criarDisciplina,
  editarDisciplina,
  excluirDisciplina,
  listarDisciplinas
} from "../controllers/disciplinaController.js";

export const disciplinaRoutes = Router();

disciplinaRoutes.post("/", criarDisciplina);
disciplinaRoutes.get("/", listarDisciplinas);
disciplinaRoutes.get("/:id", consultarDisciplina);
disciplinaRoutes.patch("/:id", editarDisciplina);
disciplinaRoutes.delete("/:id", excluirDisciplina);