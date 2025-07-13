-- AlterTable
ALTER TABLE `complaint` ADD COLUMN `affectedService` VARCHAR(191) NULL,
    ADD COLUMN `orderId` INTEGER NULL;

-- AlterTable
ALTER TABLE `prescription` ALTER COLUMN `updatedAt` DROP DEFAULT;
