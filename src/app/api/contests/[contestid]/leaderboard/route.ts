import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      contestid: string;
    }>;
  }
) {
  try {
    const { contestid } = await params;

    const contestId = Number(contestid);

    if (Number.isNaN(contestId)) {
      return NextResponse.json(
        { error: "Invalid contest id" },
        { status: 400 }
      );
    }

    const contest = await prisma.contest.findUnique({
      where: {
        id: contestId,
      },
      include: {
        submissions: {
          where: {
            contestId: contestId,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    const leaderboardMap = new Map<
      number,
      {
        userId: number;
        username: string;
        solvedProblems: Set<number>;
        submissions: number;
        penalty: number;
      }
    >();

    for (const submission of contest.submissions) {
      if (!leaderboardMap.has(submission.userId)) {
        leaderboardMap.set(submission.userId, {
          userId: submission.userId,
          username: submission.user.username,
          solvedProblems: new Set<number>(),
          submissions: 0,
          penalty: 0,
        });
      }

      const entry = leaderboardMap.get(
        submission.userId
      )!;

      entry.submissions++;

      /*
       * If this problem has already been solved,
       * ignore all later submissions.
       */
      if (
        entry.solvedProblems.has(
          submission.problemId
        )
      ) {
        continue;
      }

      /*
       * First AC solves the problem.
       */
      if (submission.verdict === "AC") {
        entry.solvedProblems.add(
          submission.problemId
        );
      } else {
        /*
         * Wrong submission before AC.
         *
         * CE, WA, TLE, MLE and RE all count
         * as a penalty for now.
         */
        entry.penalty += 10;
      }
    }

    const leaderboard = Array.from(
      leaderboardMap.values()
    )
      .map((entry) => ({
        userId: entry.userId,
        username: entry.username,

        solved:
          entry.solvedProblems.size,

        score:
          entry.solvedProblems.size * 100,

        submissions:
          entry.submissions,

        penalty:
          entry.penalty,
      }))
      .sort((a, b) => {
        // More solved problems first
        if (b.solved !== a.solved) {
          return b.solved - a.solved;
        }

        // Lower penalty wins
        if (a.penalty !== b.penalty) {
          return a.penalty - b.penalty;
        }

        // Deterministic final ordering
        return a.username.localeCompare(
          b.username
        );
      });

    const rankedLeaderboard =
      leaderboard.map(
        (entry, index) => ({
          rank: index + 1,
          ...entry,
        })
      );

    return NextResponse.json({
      contest: {
        id: contest.id,
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
      },

      leaderboard:
        rankedLeaderboard,
    });
  } catch (error) {
    console.error(
      "LEADERBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
  }
}