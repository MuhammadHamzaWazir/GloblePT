-- AlterTable
ALTER TABLE `prescription` MODIFY `amount` DOUBLE NOT NULL DEFAULT 0,
    ALTER COLUMN `updatedAt` DROP DEFAULT;
