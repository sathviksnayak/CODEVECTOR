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

  const contestProblem = await prisma.contestProblem.findUnique({
    where: {
      contestId_problemId: {
        contestId: Number(contestid),
        problemId: Number(problemid),
      },
    },
    include: {
      problem: {
        include: {
          testCases: true,
        },
      },
      contest: true,
    },
  });

  if (!contestProblem) {
    return Response.json(
      { error: "Problem not found in this contest" },
      { status: 404 }
    );
  }

  return Response.json({
    problem: contestProblem.problem,
    contest: contestProblem.contest,
  });
}