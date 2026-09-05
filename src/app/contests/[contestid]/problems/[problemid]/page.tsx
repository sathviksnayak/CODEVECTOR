import ContestProblemPageContent from "./ContestProblemPageContent";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

const getContestProblem = cache(
  async (contestId: number, problemId: number) =>
    prisma.contest.findUnique({
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
                testCases: {
                  where: {
                    isHidden: false,
                  },
                },
              },
            },
          },
        },
      },
    })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    contestid: string;
    problemid: string;
  }>;
}): Promise<Metadata> {
  const { contestid, problemid } = await params;
  const contestId = Number(contestid);
  const problemId = Number(problemid);

  if (!Number.isInteger(contestId) || !Number.isInteger(problemId)) {
    return {};
  }

  const user = await getUser();

  if (!user) {
    return {};
  }

  const contest = await getContestProblem(contestId, problemId);
  const contestProblem = contest?.problems[0];

  if (!contest || !contestProblem) {
    return {};
  }

  const now = new Date();

  if (now < contest.startTime || now >= contest.endTime) {
    return {};
  }

  const participant =
    await prisma.contestParticipant.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId: user.id,
        },
      },
    });

  if (!participant) {
    return {};
  }

  const statement = contestProblem.problem.statement
    .trim()
    .replace(/\s+/g, " ");
  const description = `${contestProblem.problem.title} in ${contest.title}: ${statement}`;

  return {
    title: `${contestProblem.problem.title} - ${contest.title}`,
    description:
      description.length > 160
        ? `${description.slice(0, 157)}...`
        : description,
  };
}

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

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const contest = await getContestProblem(contestId, problemId);

  if (!contest || contest.problems.length === 0) {
    notFound();
  }

  const now = new Date();

  if (now < contest.startTime || now >= contest.endTime) {
    redirect(`/contests/${contestId}`);
  }

  const participant =
    await prisma.contestParticipant.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId: user.id,
        },
      },
    });

  if (!participant) {
    redirect(`/contests/${contestId}`);
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