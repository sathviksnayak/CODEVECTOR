import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JoinButton from "./joinButton";


async function getContests() {
  return prisma.contest.findMany({
    orderBy: {
      startTime: "desc",
    },
  });
}

function getStatus(start: Date, end: Date) {
  const now = new Date();

  if (now < start) return "Upcoming";
  if (now >= end) return "Ended";

  return "Live";
}

function statusStyle(status: string) {
  switch (status) {
    case "Live":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "Upcoming":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "Ended":
      return "border-gray-700 bg-gray-800/50 text-gray-400";

    default:
      return "border-gray-700 bg-gray-800/50 text-gray-400";
  }
}

export default async function ContestsPage() {
  const contests = await getContests();

  console.log(contests);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Contests
          </h1>

          <p className="mt-2 text-gray-400">
            Compete against other programmers and test
            your problem-solving skills.
          </p>
        </div>

        {/* Contest list */}
        <div className="space-y-5">

          {contests.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950 px-6 py-12 text-center text-gray-500">
              No contests available.
            </div>
          ) : (
            contests.map((contest: any) => {
              const start = new Date(contest.startTime);
              const end = new Date(contest.endTime);

              const status = getStatus(start, end);

              return (
                <div
                  key={contest.id}
                  className="rounded-xl border border-gray-800 bg-gray-950 p-6 transition-colors hover:border-gray-700"
                >

                  {/* Header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <h2 className="text-xl font-semibold">
                        {contest.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Contest #{contest.id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>

                  </div>

                  {/* Time information */}
                  <div className="mt-6 grid gap-5 border-t border-gray-800 pt-5 sm:grid-cols-2">

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Starts
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        {start.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Ends
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        {end.toLocaleString()}
                      </p>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">

                    {/* Join */}
                    {status === "Live" && (
                      <JoinButton
                        contestId={contest.id}
                      />
                    )}

                    {/* Leaderboard */}
                    <Link
                      href={`/contests/${contest.id}/leaderboard`}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-4 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700"
                    >
                      Leaderboard
                    </Link>

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* Contest count */}
        {contests.length > 0 && (
          <p className="mt-5 text-sm text-gray-500">
            {contests.length} contest
            {contests.length !== 1 ? "s" : ""} available
          </p>
        )}

      </div>
    </main>
  );
}