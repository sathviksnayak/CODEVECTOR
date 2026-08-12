import ProblemPageContent from "./ProblemPageContent";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";


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


  const problem = await prisma.problem.findUnique({
    where: {
      id: problemId,
    },
    include: {
      testCases: true,
    },
  });


  if (!problem) {
    notFound();
  }


  const submissions = await prisma.submission.findMany({
    where: {
      problemId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });


  return (
    <ProblemPageContent
      problem={problem}
      submissions={submissions}
    />
  );
}