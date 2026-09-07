import { calculateContestLeaderboard } from "@/lib/contestLeaderboard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ contestid: string }>;
};

export async function GET(
  _request: Request,
  { params }: Params
) {
  try {
    const { contestid } = await params;
    const contestId = Number(contestid);

    if (!Number.isInteger(contestId)) {
      return NextResponse.json(
        { error: "Invalid contest ID" },
        { status: 400 }
      );
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
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
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    const participants = await prisma.contestParticipant.findMany({
      where: { contestId },
      select: {
        userId: true,
        user: { select: { username: true } },
      },
    });

    const submissions = await prisma.submission.findMany({
      where: {
        contestId,
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

    const leaderboard = calculateContestLeaderboard({
      problems: contest.problems,
      participants: participants.map((participant) => ({
        userId: participant.userId,
        username: participant.user.username,
      })),
      submissions,
      startTime: contest.startTime,
    });

    return NextResponse.json({ contest, leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to calculate leaderboard" },
      { status: 500 }
    );
  }
}
