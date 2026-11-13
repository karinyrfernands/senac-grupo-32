export class AppError extends Error {
    statusCode: number;
    codigo: string;
    detalhes?: unknown;

    constructor(
        mensagem: string,
        statusCode = 400,
        codigo = "ERRO_NA_REQUISICAO",
        detalhes?: unknown
    ){
        super(mensagem);

        this.name = "AppError";
        this.statusCode = statusCode;
        this.codigo = codigo;
        this.detalhes = detalhes;
    }
}