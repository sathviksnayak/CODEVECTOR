export type ContestLeaderboardProblem = {
  problemId: number;
  points: number;
};

export type ContestLeaderboardParticipant = {
  userId: number;
  username: string;
};

export type ContestLeaderboardSubmission = {
  id: number;
  userId: number;
  problemId: number;
  verdict: string | null;
  submittedAt: Date;
};

export type ContestLeaderboardEntry = {
  userId: number;
  username: string;
  score: number;
  solved: number;
  penalty: number;
};

type ProblemResult = {
  solved: boolean;
  wrongAttempts: number;
  acceptedAt: Date | null;
};

export function calculateContestLeaderboard({
  problems,
  participants,
  submissions,
  startTime,
}: {
  problems: ContestLeaderboardProblem[];
  participants: ContestLeaderboardParticipant[];
  submissions: ContestLeaderboardSubmission[];
  startTime: Date;
}): ContestLeaderboardEntry[] {
  const leaderboardMap = new Map<number, ContestLeaderboardEntry>();

  for (const participant of participants) {
    leaderboardMap.set(participant.userId, {
      userId: participant.userId,
      username: participant.username,
      score: 0,
      solved: 0,
      penalty: 0,
    });
  }

  const problemPoints = new Map(
    problems.map((problem) => [problem.problemId, problem.points])
  );
  const userProblems = new Map<number, Map<number, ProblemResult>>();

  for (const submission of submissions) {
    if (!leaderboardMap.has(submission.userId)) {
      continue;
    }

    if (!problemPoints.has(submission.problemId)) {
      continue;
    }

    let problemsForUser = userProblems.get(submission.userId);
    if (!problemsForUser) {
      problemsForUser = new Map();
      userProblems.set(submission.userId, problemsForUser);
    }

    const existing = problemsForUser.get(submission.problemId);

    if (existing?.solved) {
      continue;
    }

    if (submission.verdict === "AC") {
      problemsForUser.set(submission.problemId, {
        solved: true,
        wrongAttempts: existing?.wrongAttempts ?? 0,
        acceptedAt: submission.submittedAt,
      });
    } else {
      problemsForUser.set(submission.problemId, {
        solved: false,
        wrongAttempts: (existing?.wrongAttempts ?? 0) + 1,
        acceptedAt: null,
      });
    }
  }

  for (const [userId, problemsForUser] of userProblems) {
    const entry = leaderboardMap.get(userId);
    if (!entry) {
      continue;
    }

    for (const [problemId, result] of problemsForUser) {
      if (!result.solved || result.acceptedAt === null) {
        continue;
      }

      entry.score += problemPoints.get(problemId) ?? 0;
      entry.solved += 1;
      entry.penalty +=
        Math.floor(
          (result.acceptedAt.getTime() - startTime.getTime()) /
            (1000 * 60)
        ) + result.wrongAttempts * 20;
    }
  }

  return Array.from(leaderboardMap.values()).sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty;
    }

    return a.userId - b.userId;
  });
}
