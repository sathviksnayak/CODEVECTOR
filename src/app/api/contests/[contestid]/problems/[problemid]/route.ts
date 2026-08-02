import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      contestid: string;
      problemid: string;
    }>;
  }
) {
  const { contestid, problemid } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(problemid),
    },
    include: {
      testCases: true,
    },
  });

  return Response.json(problem);
}