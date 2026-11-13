import "dotenv/config";

import { app } from "./app.js";
import { prisma } from "./database/prisma.js";

const porta = Number(process.env.PORT ?? 3000);

const servidor = app.listen(porta, () => {
  console.log(
    `Servidor executando em http://localhost:${porta}`
  );
});

async function encerrarAplicacao() {
  console.log("Encerrando aplicação...");

  await prisma.$disconnect();

  servidor.close(() => {
    console.log("Servidor encerrado.");
    process.exit(0);
  });
}

process.on("SIGINT", encerrarAplicacao);
process.on("SIGTERM", encerrarAplicacao);