import ProblemPageContent from "./ProblemPageContent";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { notFound } from "next/navigation";
import { cache } from "react";

const getProblem = cache(async (problemId: number) =>
  prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    include: {
      testCases: {
        where: {
          isHidden: false,
        },
      },
    },
  })
);

function problemDescription(problem: {
  statement: string;
  difficulty: string;
}) {
  const statement = problem.statement.trim().replace(/\s+/g, " ");
  const description = `${problem.difficulty} programming problem: ${statement}`;

  return description.length > 160
    ? `${description.slice(0, 157)}...`
    : description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ problemid: string }>;
}): Promise<Metadata> {
  const { problemid } = await params;
  const problemId = Number(problemid);

  if (!Number.isInteger(problemId)) {
    return {};
  }

  const problem = await getProblem(problemId);

  if (!problem) {
    return {};
  }

  return {
    title: problem.title,
    description: problemDescription(problem),
  };
}


export default async function Page({
  params,
}: {
  params: Promise<{ problemid: string }>;
}) {
  const { problemid } = await params;


  const problemId = Number(problemid);


  if (!Number.isInteger(problemId)) {
    notFound();
  }


  const problem = await getProblem(problemId);


  if (!problem) {
    notFound();
  }


  const user = await getUser();

  const submissions = user
    ? await prisma.submission.findMany({
        where: {
          problemId,
          userId: user.id,
        },
        select: {
          id: true,
          verdict: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];


  return (
    <ProblemPageContent
      problem={problem}
      submissions={submissions}
    />
  );
}