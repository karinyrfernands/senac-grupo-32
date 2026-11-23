import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

const portaBanco = Number(process.env.DB_PORT ?? 3306);

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? "localhost",
  port: portaBanco,
  user: process.env.DB_USER ?? "projeto_api",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "projeto_integrador",
  connectionLimit: 5,

  // O MySQL 8 usa o plugin de senha "caching_sha2_password". Sem a linha
  // abaixo, o driver nao consegue concluir o login no banco e toda consulta
  // falha com "RSA public key is not available client side".
  allowPublicKeyRetrieval: true
});

export const prisma = new PrismaClient({
  adapter
});