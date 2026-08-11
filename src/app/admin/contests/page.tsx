import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

function getStatus(startTime: Date, endTime: Date) {
  const now = new Date();

  if (now < startTime) return "Upcoming";
  if (now > endTime) return "Ended";

  return "Live";
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Upcoming":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    case "Live":
      return "bg-green-500/10 text-green-400 border-green-500/20";

    case "Ended":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";

    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export default async function AdminContestsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if ( user.role!=="SUPERADMIN" && user.role !== "ADMIN" ) {
    redirect("/");
  }
  const contests = await prisma.contest.findMany({
    orderBy: {
      startTime: "desc",
    },
    include: {
      problems: true,
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Contests
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your programming contests.
            </p>
          </div>

          <Link
            href="/admin/contests/create"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
          >
            + Create Contest
          </Link>
        </div>

        {/* Contest list */}
        <div className="mt-8 space-y-4">
          {contests.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-8 text-center text-gray-500">
              No contests found.
            </div>
          ) : (
            contests.map((contest) => {
              const status = getStatus(
                new Date(contest.startTime),
                new Date(contest.endTime)
              );

              return (
                <div
                  key={contest.id}
                  className="rounded-xl border border-gray-800 bg-gray-950 p-5"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {contest.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Contest #{contest.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-5 grid gap-4 border-t border-gray-800 pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Starts
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        {new Date(
                          contest.startTime
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Ends
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        {new Date(
                          contest.endTime
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Problems
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        {contest.problems.length}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
                    {status === "Upcoming" ? (
                      <Link
                        href={`/admin/contests/${contest.id}/edit`}
                        className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
                      >
                        Edit
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-600">
                        Editing locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}