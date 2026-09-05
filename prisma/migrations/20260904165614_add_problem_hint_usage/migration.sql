-- CreateTable
CREATE TABLE "ProblemHintUsage" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProblemHintUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProblemHintUsage_userId_problemId_key" ON "ProblemHintUsage"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "ProblemHintUsage" ADD CONSTRAINT "ProblemHintUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemHintUsage" ADD CONSTRAINT "ProblemHintUsage_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
