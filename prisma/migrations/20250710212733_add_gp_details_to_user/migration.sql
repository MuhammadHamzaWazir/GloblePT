-- AlterTable
ALTER TABLE `prescription` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `gpAddress` VARCHAR(191) NULL,
    ADD COLUMN `gpEmail` VARCHAR(191) NULL,
    ADD COLUMN `gpName` VARCHAR(191) NULL,
    ADD COLUMN `gpPhone` VARCHAR(191) NULL,
    ADD COLUMN `gpRegistrationNumber` VARCHAR(191) NULL,
    ADD COLUMN `practiceName` VARCHAR(191) NULL;
