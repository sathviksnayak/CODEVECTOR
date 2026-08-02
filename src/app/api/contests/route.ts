import { prisma } from "@/lib/prisma";

export async function GET() {
  const contests = await prisma.contest.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(contests);
}