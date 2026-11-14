/*
  Warnings:

  - A unique constraint covering the columns `[usuario_id,nome]` on the table `disciplinas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuario_id` to the `atividades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `disciplinas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `disciplinas_nome_key` ON `disciplinas`;

-- AlterTable
ALTER TABLE `atividades` ADD COLUMN `usuario_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `disciplinas` ADD COLUMN `usuario_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `senha_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `atividades_usuario_id_idx` ON `atividades`(`usuario_id`);

-- CreateIndex
CREATE UNIQUE INDEX `disciplinas_usuario_id_nome_key` ON `disciplinas`(`usuario_id`, `nome`);

-- AddForeignKey
ALTER TABLE `disciplinas` ADD CONSTRAINT `disciplinas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `atividades` ADD CONSTRAINT `atividades_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
