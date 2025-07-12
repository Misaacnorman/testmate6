-- CreateTable
CREATE TABLE `SampleSet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NULL,
    `L` VARCHAR(191) NULL,
    `W` VARCHAR(191) NULL,
    `H` VARCHAR(191) NULL,
    `t` VARCHAR(191) NULL,
    `numPerSqm` VARCHAR(191) NULL,
    `blockType` VARCHAR(191) NULL,
    `holes` JSON NULL,
    `dateOfCast` DATETIME(3) NULL,
    `dateOfTest` DATETIME(3) NULL,
    `age` VARCHAR(191) NULL,
    `areaOfUse` VARCHAR(191) NULL,
    `serialNumbers` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SampleSet` ADD CONSTRAINT `SampleSet_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
