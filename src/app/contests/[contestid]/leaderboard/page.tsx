import LeaderboardClient from "./LeaderboardClient";
import { calculateContestLeaderboard } from "@/lib/contestLeaderboard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getLeaderboard(contestId: string) {
  const id = Number(contestId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const contest = await prisma.contest.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      problems: {
        select: { problemId: true, points: true },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  const participants = await prisma.contestParticipant.findMany({
    where: { contestId: id },
    select: {
      userId: true,
      user: { select: { username: true } },
    },
  });

  const submissions = await prisma.submission.findMany({
    where: {
      contestId: id,
      problemId: {
        in: contest.problems.map((problem) => problem.problemId),
      },
      submittedAt: {
        gte: contest.startTime,
        lt: contest.endTime,
      },
    },
    select: {
      id: true,
      userId: true,
      problemId: true,
      verdict: true,
      submittedAt: true,
    },
    orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
  });

  return {
    contest,
    leaderboard: calculateContestLeaderboard({
      problems: contest.problems,
      participants: participants.map((participant) => ({
        userId: participant.userId,
        username: participant.user.username,
      })),
      submissions,
      startTime: contest.startTime,
    }),
  };
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ contestid: string }>;
}) {
  const { contestid } = await params;
  const data = await getLeaderboard(contestid);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-4xl font-bold">{data.contest.title}</h1>
        <p className="mt-2 text-gray-400">Contest Leaderboard</p>
        <div className="mt-10">
          <LeaderboardClient
            contestId={contestid}
            initialLeaderboard={data.leaderboard}
            startTime={data.contest.startTime.toISOString()}
            endTime={data.contest.endTime.toISOString()}
          />
        </div>
      </div>
    </div>
  );
}
