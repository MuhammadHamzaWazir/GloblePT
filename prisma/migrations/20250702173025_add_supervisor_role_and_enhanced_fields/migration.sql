-- AlterTable
ALTER TABLE `prescription` ADD COLUMN `ageRestricted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `capacityConfirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `medicineType` VARCHAR(191) NOT NULL DEFAULT 'P',
    ADD COLUMN `minimumAge` INTEGER NOT NULL DEFAULT 16,
    ADD COLUMN `pharmacistApprovalRequired` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `prescribedBy` VARCHAR(191) NULL,
    ADD COLUMN `prescriberGMC` VARCHAR(191) NULL,
    ADD COLUMN `prescriptionValidated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `requiresPrescription` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `riskAssessmentComplete` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `accountStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `addressProofUrl` VARCHAR(191) NULL,
    ADD COLUMN `ageVerificationMethod` VARCHAR(191) NULL,
    ADD COLUMN `ageVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `capacityAssessed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `capacityAssessedAt` DATETIME(3) NULL,
    ADD COLUMN `capacityAssessedBy` INTEGER NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `identityVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `identityVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `identityVerifiedBy` INTEGER NULL,
    ADD COLUMN `photoIdUrl` VARCHAR(191) NULL,
    ADD COLUMN `twoFactorBackupCodes` VARCHAR(191) NULL,
    ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL,
    ADD COLUMN `verificationNotes` TEXT NULL;

-- CreateTable
CREATE TABLE `MedicalProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currentMedications` TEXT NULL,
    `allergies` TEXT NULL,
    `medicalConditions` TEXT NULL,
    `isPregnant` BOOLEAN NOT NULL DEFAULT false,
    `isBreastfeeding` BOOLEAN NOT NULL DEFAULT false,
    `pregnancyDueDate` DATETIME(3) NULL,
    `understandsRisks` BOOLEAN NOT NULL DEFAULT false,
    `canFollowInstructions` BOOLEAN NOT NULL DEFAULT false,
    `hasDecisionCapacity` BOOLEAN NOT NULL DEFAULT false,
    `assessedByPharmacist` BOOLEAN NOT NULL DEFAULT false,
    `pharmacistNotes` TEXT NULL,
    `assessedAt` DATETIME(3) NULL,
    `assessedBy` INTEGER NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `emergencyContactRelation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MedicalProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_identityVerifiedBy_fkey` FOREIGN KEY (`identityVerifiedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_capacityAssessedBy_fkey` FOREIGN KEY (`capacityAssessedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalProfile` ADD CONSTRAINT `MedicalProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
