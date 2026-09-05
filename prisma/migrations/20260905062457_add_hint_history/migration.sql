/*
  Warnings:

  - Added the required column `updatedAt` to the `ProblemHintUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProblemHintUsage" DROP CONSTRAINT "ProblemHintUsage_problemId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemHintUsage" DROP CONSTRAINT "ProblemHintUsage_userId_fkey";

-- AlterTable
ALTER TABLE "ProblemHintUsage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "ProblemHintUsage" ADD CONSTRAINT "ProblemHintUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemHintUsage" ADD CONSTRAINT "ProblemHintUsage_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
