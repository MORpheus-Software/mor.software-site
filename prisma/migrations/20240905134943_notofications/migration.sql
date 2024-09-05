/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_proposalId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "jobFormId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "proposalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_jobFormId_fkey" FOREIGN KEY ("jobFormId") REFERENCES "JobForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
