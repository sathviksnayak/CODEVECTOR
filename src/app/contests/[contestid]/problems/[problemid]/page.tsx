import ContestProblemPageContent from "./ContestProblemPageContent";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function ContestProblemPage({
  params,
}: {
  params: Promise<{
    contestid: string;
    problemid: string;
  }>;
}) {
  const { contestid, problemid } = await params;

  const contestId = Number(contestid);
  const problemId = Number(problemid);

  if (
    !Number.isInteger(contestId) ||
    !Number.isInteger(problemId)
  ) {
    notFound();
  }

  const contest = await prisma.contest.findUnique({
    where: {
      id: contestId,
    },
    include: {
      problems: {
        where: {
          problemId,
        },
        include: {
          problem: {
            include: {
              testCases: true,
            },
          },
        },
      },
    },
  });

  if (!contest || contest.problems.length === 0) {
    notFound();
  }

  const problem = contest.problems[0].problem;

  return (
    <ContestProblemPageContent
      problem={problem}
      contest={contest}
      contestId={contestId}
    />
  );
}

export default ContestProblemPage;