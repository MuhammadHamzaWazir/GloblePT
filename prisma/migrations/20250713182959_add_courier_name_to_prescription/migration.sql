-- AlterTable
ALTER TABLE `prescription` ADD COLUMN `courierName` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
