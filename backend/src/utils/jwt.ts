import "dotenv/config";
import jwt from "jsonwebtoken";

function lerSegredo(): string {
  const segredo = process.env.JWT_SECRET;

  if (!segredo || segredo.length < 32) {
    throw new Error(
      "JWT_SECRET não está configurado corretamente no arquivo .env. " +
        "Use um texto aleatório com pelo menos 32 caracteres (veja o README)."
    );
  }

  return segredo;
}

const segredo = lerSegredo();

export function gerarToken(usuarioId: number): string {
  return jwt.sign({}, segredo, {
    subject: String(usuarioId),
    expiresIn: "7d"
  });
}

// Retorna o ID do usuário dono do token, ou null se o token for inválido ou estiver expirado.
export function verificarToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, segredo);

    if (typeof payload === "string" || !payload.sub) {
      return null;
    }

    const id = Number(payload.sub);

    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
