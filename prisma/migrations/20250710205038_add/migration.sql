/*
  Warnings:

  - You are about to drop the column `file1Url` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `file2Url` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nationalInsuranceNumber` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nhsNumber` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verificationNotes` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `prescription` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `file1Url`,
    DROP COLUMN `file2Url`,
    DROP COLUMN `nationalInsuranceNumber`,
    DROP COLUMN `nhsNumber`,
    DROP COLUMN `verificationNotes`,
    ADD COLUMN `role` ENUM('customer', 'staff', 'admin', 'assistant', 'supervisor') NOT NULL DEFAULT 'customer';
