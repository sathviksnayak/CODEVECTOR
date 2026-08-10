import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      problemid: string;
    }>;
  }
) {
  const { problemid } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(problemid),
    },
    include: {
      testCases: true,
    },
  });

  if (!problem) {
    return Response.json(
      { error: "Problem not found" },
      { status: 404 }
    );
  }

  return Response.json(problem);
}