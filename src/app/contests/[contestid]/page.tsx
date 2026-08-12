import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { notFound, redirect } from "next/navigation";

export default async function ContestPage({
  params,
}: {
  params: Promise<{ contestid: string }>;
}) {
  const { contestid } = await params;

  const contestId = Number(contestid);

  if (!Number.isInteger(contestId)) {
    notFound();
  }

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const contest = await prisma.contest.findUnique({
    where: {
      id: contestId,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  if (!contest) {
    notFound();
  }

  // Do not allow access to contest problems before the contest starts
  const now = new Date();
  const startTime = new Date(contest.startTime);

  if (now < startTime) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-semibold">
            Contest has not started yet
          </h1>

          <p className="mt-2 text-gray-400">
            This contest starts on{" "}
            {startTime.toLocaleString()}.
          </p>

          <Link
            href="/contests"
            className="mt-6 inline-flex rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-700"
          >
            Back to Contests
          </Link>
        </div>
      </main>
    );
  }

  const participant = await prisma.contestParticipant.findUnique({
    where: {
      contestId_userId: {
        contestId,
        userId: user.id,
      },
    },
  });

  if (!participant) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-semibold">
            You have not joined this contest
          </h1>

          <p className="mt-2 text-gray-400">
            Join the contest before accessing its problems.
          </p>

          <Link
            href="/contests"
            className="mt-6 inline-flex rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium transition hover:bg-gray-700"
          >
            Back to Contests
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {contest.title}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Contest #{contest.id}
              </p>
            </div>

            <Link
              href={`/contests/${contest.id}/leaderboard`}
              className="inline-flex w-fit items-center rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800"
            >
              Leaderboard
            </Link>
          </div>

          <div className="mt-6 grid gap-4 border-t border-gray-800 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Starts
              </p>

              <p className="mt-1 text-sm text-gray-300">
                {new Date(contest.startTime).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Ends
              </p>

              <p className="mt-1 text-sm text-gray-300">
                {new Date(contest.endTime).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Problems
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {contest.problems.length}{" "}
              {contest.problems.length === 1
                ? "problem"
                : "problems"}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
            {contest.problems.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No problems have been added to this contest.
              </div>
            ) : (
              contest.problems.map((cp, index) => (
                <Link
                  key={cp.problem.id}
                  href={`/contests/${contest.id}/problems/${cp.problem.id}`}
                  className="flex items-center justify-between border-b border-gray-800 px-6 py-5 transition hover:bg-gray-900 last:border-b-0"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-8 text-sm font-medium text-gray-500">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <div>
                      <h3 className="font-medium text-white">
                        {cp.problem.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Problem #{cp.problem.id}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs font-medium text-gray-400">
                    {cp.problem.difficulty}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}