import "dotenv/config";
import express from "express";
import cors from "cors";

import { atividadeRoutes } from "./routes/atividadeRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { disciplinaRoutes } from "./routes/disciplinaRoutes.js";
import { autenticar } from "./middlewares/autenticar.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

const frontendUrl =
  process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: frontendUrl
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    mensagem: "API do Projeto Integrador funcionando!",
    versao: "1.1.0"
  });
});

app.get("/api/saude", (_req, res) => {
  res.status(200).json({
    status: "API funcionando"
  });
});

// Rotas públicas: cadastro e login (o /me exige token, definido na própria rota).
app.use("/api/auth", authRoutes);

// Rotas protegidas: só funcionam com um token válido.
app.use("/api/disciplinas", autenticar, disciplinaRoutes);
app.use("/api/atividades", autenticar, atividadeRoutes);

app.use((_req, res) => {
  res.status(404).json({
    erro: "ROTA_NAO_ENCONTRADA",
    mensagem: "O endereço solicitado não existe na API."
  });
});

app.use(errorHandler);
