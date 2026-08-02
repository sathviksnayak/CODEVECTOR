import { prisma } from "@/lib/prisma";

export async function GET() {
await prisma.contestProblem.createMany({
  data: [
    {
      contestId: 1,
      problemId: 1,
    },
    {
      contestId: 1,
      problemId: 2,
    },
    {
      contestId: 1,
      problemId: 3,
    },
  ],
});
  return Response.json({
    success: true,
  });
}