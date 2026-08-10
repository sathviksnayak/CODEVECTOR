import "dotenv/config";

import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.submission.deleteMany();
  await prisma.contestParticipant.deleteMany();
  await prisma.contestProblem.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.contest.deleteMany();

  console.log("Database reset successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });