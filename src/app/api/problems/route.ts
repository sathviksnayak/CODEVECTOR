import { prisma } from "@/lib/prisma";

export async function GET() {
  const problems = await prisma.problem.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(problems);
}