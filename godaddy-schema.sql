-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `nationalInsuranceNumber` VARCHAR(191) NULL,
    `nhsNumber` VARCHAR(191) NULL,
    `photoIdUrl` VARCHAR(191) NULL,
    `addressProofUrl` VARCHAR(191) NULL,
    `identityVerified` BOOLEAN NOT NULL DEFAULT false,
    `identityVerifiedAt` DATETIME(3) NULL,
    `identityVerifiedBy` INTEGER NULL,
    `ageVerified` BOOLEAN NOT NULL DEFAULT false,
    `ageVerificationMethod` VARCHAR(191) NULL,
    `twoFactorSecret` VARCHAR(191) NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorBackupCodes` VARCHAR(191) NULL,
    `emailVerificationCode` VARCHAR(191) NULL,
    `emailVerificationCodeExpiry` DATETIME(3) NULL,
    `emailVerificationAttempts` INTEGER NOT NULL DEFAULT 0,
    `lastEmailVerificationSent` DATETIME(3) NULL,
    `capacityAssessed` BOOLEAN NOT NULL DEFAULT false,
    `capacityAssessedAt` DATETIME(3) NULL,
    `capacityAssessedBy` INTEGER NULL,
    `accountStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `verificationNotes` TEXT NULL,
    `file1Url` VARCHAR(191) NULL,
    `file2Url` VARCHAR(191) NULL,
    `roleId` INTEGER NULL,
    `supervisorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Permission_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Complaint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'General Complaint',
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'service',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `fileUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'received',
    `assignedToId` INTEGER NULL,
    `assignedAt` DATETIME(3) NULL,
    `assignedById` INTEGER NULL,
    `resolution` TEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `resolvedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Staff_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `staffId` INTEGER NULL,
    `medicine` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(191) NULL,
    `instructions` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `prescriptionText` TEXT NULL,
    `medicineType` VARCHAR(191) NOT NULL DEFAULT 'P',
    `requiresPrescription` BOOLEAN NOT NULL DEFAULT false,
    `ageRestricted` BOOLEAN NOT NULL DEFAULT false,
    `minimumAge` INTEGER NOT NULL DEFAULT 16,
    `capacityConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `riskAssessmentComplete` BOOLEAN NOT NULL DEFAULT false,
    `pharmacistApprovalRequired` BOOLEAN NOT NULL DEFAULT true,
    `prescribedBy` VARCHAR(191) NULL,
    `prescriberGMC` VARCHAR(191) NULL,
    `prescriptionValidated` BOOLEAN NOT NULL DEFAULT false,
    `amount` DOUBLE NOT NULL,
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `stripeChargeId` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `approvedBy` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedReason` VARCHAR(191) NULL,
    `trackingNumber` VARCHAR(191) NULL,
    `dispatchedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `_RolePermissions` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_RolePermissions_AB_unique`(`A`, `B`),
    INDEX `_RolePermissions_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_identityVerifiedBy_fkey` FOREIGN KEY (`identityVerifiedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_capacityAssessedBy_fkey` FOREIGN KEY (`capacityAssessedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `Staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_resolvedById_fkey` FOREIGN KEY (`resolvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `Staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalProfile` ADD CONSTRAINT `MedicalProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RolePermissions` ADD CONSTRAINT `_RolePermissions_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RolePermissions` ADD CONSTRAINT `_RolePermissions_B_fkey` FOREIGN KEY (`B`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

