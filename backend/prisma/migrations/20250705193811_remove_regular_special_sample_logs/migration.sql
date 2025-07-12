/*
  Warnings:

  - You are about to drop the `regularsamplelog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialsamplelog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specialunit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `regularsamplelog` DROP FOREIGN KEY `RegularSampleLog_engineerUserId_fkey`;

-- DropForeignKey
ALTER TABLE `regularsamplelog` DROP FOREIGN KEY `RegularSampleLog_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `regularsamplelog` DROP FOREIGN KEY `RegularSampleLog_technicianUserId_fkey`;

-- DropForeignKey
ALTER TABLE `specialsamplelog` DROP FOREIGN KEY `SpecialSampleLog_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `specialunit` DROP FOREIGN KEY `SpecialUnit_specialSampleLogId_fkey`;

-- DropTable
DROP TABLE `regularsamplelog`;

-- DropTable
DROP TABLE `specialsamplelog`;

-- DropTable
DROP TABLE `specialunit`;
