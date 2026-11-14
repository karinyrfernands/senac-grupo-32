import { Router } from "express";

import {
  cadastrar,
  login,
  perfil
} from "../controllers/authController.js";
import { autenticar } from "../middlewares/autenticar.js";

export const authRoutes = Router();

authRoutes.post("/cadastro", cadastrar);
authRoutes.post("/login", login);
authRoutes.get("/me", autenticar, perfil);
