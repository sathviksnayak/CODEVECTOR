import LeaderboardClient from "./LeaderboardClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type ProblemResult = {
  solved: boolean;
  wrongAttempts: number;
  acceptedAt: Date | null;
};

type LeaderboardEntry = {
  userId: number;
  username: string;
  solved: number;
  score: number;
  penalty: number;
};

async function getLeaderboard(contestId: string) {
  const id = Number(contestId);

  if (!Number.isInteger(id)) {
    notFound();
  }

  /*
   * Get contest and its problems.
   */
  const contest = await prisma.contest.findUnique({
    where: {
      id,
    },
    include: {
      problems: true,
    },
  });

  if (!contest) {
    notFound();
  }

  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  /*
   * Get EVERYONE who joined the contest.
   */
  const participants =
    await prisma.contestParticipant.findMany({
      where: {
        contestId: id,
      },
      include: {
        user: true,
      },
    });

  /*
   * Get the actual problem IDs from the
   * ContestProblem join table.
   */
  const problemIds = contest.problems.map(
    (problem) => problem.problemId
  );

  /*
   * Start the leaderboard with EVERY participant.
   */
  const leaderboardMap = new Map<
    number,
    LeaderboardEntry
  >();

  for (const participant of participants) {
    leaderboardMap.set(participant.userId, {
      userId: participant.userId,
      username: participant.user.username,
      solved: 0,
      score: 0,
      penalty: 0,
    });
  }

  /*
   * If there are no problems, everyone still
   * appears with zero solved.
   */
  if (problemIds.length === 0) {
    return {
      contest,
      leaderboard: Array.from(
        leaderboardMap.values()
      ),
    };
  }

  /*
   * Get submissions belonging specifically
   * to this contest and its problems.
   */
  const submissions =
    await prisma.submission.findMany({
      where: {
        contestId: id,

        problemId: {
          in: problemIds,
        },

        createdAt: {
          gte: startTime,
          lt: endTime,
        },
      },

      include: {
        user: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  /*
   * userId
   *   └── problemId
   *         ├── solved
   *         ├── wrongAttempts
   *         └── acceptedAt
   */
  const userProblems = new Map<
    number,
    Map<number, ProblemResult>
  >();

  /*
   * Process submissions chronologically.
   */
  for (const submission of submissions) {
    const userId = submission.userId;
    const problemId = submission.problemId;

    /*
     * Ignore non-participants.
     */
    if (!leaderboardMap.has(userId)) {
      continue;
    }

    if (!userProblems.has(userId)) {
      userProblems.set(
        userId,
        new Map<number, ProblemResult>()
      );
    }

    const problems =
      userProblems.get(userId)!;

    const existing =
      problems.get(problemId);

    /*
     * Once solved, later submissions don't matter.
     */
    if (existing?.solved) {
      continue;
    }

    /*
     * Accepted submission.
     */
    if (submission.verdict === "AC") {
      problems.set(problemId, {
        solved: true,

        /*
         * Preserve wrong attempts before AC.
         */
        wrongAttempts:
          existing?.wrongAttempts ?? 0,

        acceptedAt:
          submission.createdAt,
      });

      continue;
    }

    /*
     * Any non-AC submission is a wrong attempt.
     */
    problems.set(problemId, {
      solved: false,

      wrongAttempts:
        (existing?.wrongAttempts ?? 0) + 1,

      acceptedAt: null,
    });
  }

  /*
   * Calculate solved count and penalty.
   */
  for (const [
    userId,
    problems,
  ] of userProblems.entries()) {
    let solved = 0;
    let penalty = 0;

    for (const result of problems.values()) {
      if (!result.solved) {
        continue;
      }

      solved++;

      /*
       * Minutes from contest start
       * until first AC.
       */
      const minutes = Math.floor(
        (
          result.acceptedAt!.getTime() -
          startTime.getTime()
        ) /
          (1000 * 60)
      );

      /*
       * Penalty =
       * solve time + 20 minutes per wrong attempt.
       */
      penalty +=
        minutes +
        result.wrongAttempts * 20;
    }

    const entry =
      leaderboardMap.get(userId);

    if (!entry) {
      continue;
    }

    entry.solved = solved;
    entry.score = solved;
    entry.penalty = penalty;
  }

  /*
   * Convert Map to array.
   */
  const leaderboard =
    Array.from(
      leaderboardMap.values()
    );

  /*
   * Ranking:
   * 1. More solved
   * 2. Lower penalty
   * 3. Lower user ID
   */
  leaderboard.sort((a, b) => {
    if (a.solved !== b.solved) {
      return b.solved - a.solved;
    }

    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty;
    }

    return a.userId - b.userId;
  });

  return {
    contest,
    leaderboard,
  };
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{
    contestid: string;
  }>;
}) {
  const { contestid } = await params;

  const data =
    await getLeaderboard(contestid);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-4xl font-bold">
          {data.contest.title}
        </h1>

        <p className="mt-2 text-gray-400">
          Contest Leaderboard
        </p>

        <div className="mt-10">
          <LeaderboardClient
            contestId={contestid}
            initialLeaderboard={
              data.leaderboard
            }
            startTime={
              data.contest.startTime.toISOString()
            }
            endTime={
              data.contest.endTime.toISOString()
            }
          />
        </div>
      </div>
    </div>
  );
}