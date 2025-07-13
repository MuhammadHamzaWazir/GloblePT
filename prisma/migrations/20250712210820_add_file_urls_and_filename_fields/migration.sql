-- AlterTable
ALTER TABLE `prescription` ADD COLUMN `fileUrls` TEXT NULL,
    ADD COLUMN `filename` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
