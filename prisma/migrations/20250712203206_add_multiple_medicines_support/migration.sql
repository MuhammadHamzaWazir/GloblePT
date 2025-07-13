-- AlterTable
ALTER TABLE `prescription` ADD COLUMN `medicines` TEXT NULL,
    MODIFY `medicine` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
