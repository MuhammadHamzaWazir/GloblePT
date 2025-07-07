-- AlterTable
ALTER TABLE `prescription` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `emailVerificationAttempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `emailVerificationCode` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationCodeExpiry` DATETIME(3) NULL,
    ADD COLUMN `lastEmailVerificationSent` DATETIME(3) NULL;
