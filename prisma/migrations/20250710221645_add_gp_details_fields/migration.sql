/*
  Warnings:

  - You are about to drop the column `gpRegistrationNumber` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `prescription` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `gpRegistrationNumber`,
    ADD COLUMN `nhsNumber` VARCHAR(191) NULL;
