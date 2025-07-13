-- DropForeignKey
ALTER TABLE `complaint` DROP FOREIGN KEY `Complaint_assignedToId_fkey`;

-- DropIndex
DROP INDEX `Complaint_assignedToId_fkey` ON `complaint`;

-- AlterTable
ALTER TABLE `prescription` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
