import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    contestid: string;
  }>;
};

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

export async function GET(
  request: Request,
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

    /*
     * Get contest and its problems.
     */
    const contest = await prisma.contest.findUnique({
      where: {
        id: contestId,
      },
      include: {
        problems: true,
      },
    });

    if (!contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      );
    }

    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    /*
     * Get EVERYONE who joined the contest.
     *
     * This is important because a participant does not
     * need to submit anything to appear on the leaderboard.
     */
    const participants =
      await prisma.contestParticipant.findMany({
        where: {
          contestId,
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
     *
     * Everyone initially has:
     *
     * solved = 0
     * score = 0
     * penalty = 0
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
     * If the contest has no problems, we can still
     * return all participants with 0 solved.
     */
    if (problemIds.length === 0) {
      const leaderboard =
        Array.from(leaderboardMap.values());

      return NextResponse.json({
        contest: {
          id: contest.id,
          title: contest.title,
          startTime: contest.startTime,
          endTime: contest.endTime,
        },
        leaderboard,
      });
    }

    /*
     * Get submissions belonging specifically to
     * this contest.
     *
     * We also restrict them to the contest's problems.
     */
    const submissions =
      await prisma.submission.findMany({
        where: {
          contestId: contestId,

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
     * Structure:
     *
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
       * Ignore submissions from users who are not
       * registered participants.
       *
       * Normally this shouldn't happen, but keeping
       * the leaderboard based on participants is safer.
       */
      if (!leaderboardMap.has(userId)) {
        continue;
      }

      if (!userProblems.has(userId)) {
        userProblems.set(
          userId,
          new Map()
        );
      }

      const problems =
        userProblems.get(userId)!;

      const existing =
        problems.get(problemId);

      /*
       * Once a problem has been solved,
       * submissions after AC don't matter.
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
           * Preserve wrong attempts that happened
           * before the first AC.
           */
          wrongAttempts:
            existing?.wrongAttempts ?? 0,

          acceptedAt:
            submission.createdAt,
        });

        continue;
      }

      /*
       * Any non-AC submission counts as
       * a wrong attempt.
       */
      problems.set(problemId, {
        solved: false,

        wrongAttempts:
          (existing?.wrongAttempts ?? 0) + 1,

        acceptedAt: null,
      });
    }

    /*
     * Calculate the result for every participant
     * who has submissions.
     */
    for (const [
      userId,
      problems,
    ] of userProblems.entries()) {
      let solved = 0;
      let penalty = 0;

      for (const result of problems.values()) {
        /*
         * Unsolved problems don't contribute
         * to the final penalty.
         */
        if (!result.solved) {
          continue;
        }

        solved++;

        /*
         * Minutes from contest start until
         * the first accepted submission.
         */
        const minutes = Math.floor(
          (
            result.acceptedAt!.getTime() -
            startTime.getTime()
          ) /
            (1000 * 60)
        );

        /*
         * Standard penalty:
         *
         * solve time
         * +
         * 20 minutes per wrong attempt
         */
        penalty +=
          minutes +
          result.wrongAttempts * 20;
      }

      /*
       * Update the participant's leaderboard entry.
       */
      const entry =
        leaderboardMap.get(userId);

      if (!entry) {
        continue;
      }

      entry.solved = solved;

      /*
       * Currently score is simply the number
       * of solved problems.
       */
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
     *
     * 1. More problems solved
     * 2. Lower penalty
     * 3. User ID as deterministic tie-breaker
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

    return NextResponse.json({
      contest: {
        id: contest.id,
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
      },

      leaderboard,
    });
  } catch (error) {
    console.error(
      "Leaderboard error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to calculate leaderboard",
      },
      { status: 500 }
    );
  }
}