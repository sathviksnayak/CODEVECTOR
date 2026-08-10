import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function getVerdictStyle(verdict: string | null) {
  switch (verdict) {
    case "AC":
      return "text-green-400 bg-green-500/10 border-green-500/20";

    case "TLE":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";

    case "MLE":
      return "text-orange-400 bg-orange-500/10 border-orange-500/20";

    case "CE":
      return "text-red-400 bg-red-500/10 border-red-500/20";

    case "RE":
      return "text-purple-400 bg-purple-500/10 border-purple-500/20";

    case "WA":
      return "text-red-400 bg-red-500/10 border-red-500/20";

    default:
      return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  }
}

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  /*
   * Get user + latest 10 submissions
   */
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      username: true,
      email: true,

      submissions: {
        take: 10,

        include: {
          problem: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  /*
   * Get accurate statistics.
   *
   * We cannot calculate these from user.submissions
   * because that list only contains the latest 10.
   */
  const [
    totalSubmissions,
    acceptedSubmissions,
    solvedProblems,
  ] = await Promise.all([
    prisma.submission.count({
      where: {
        userId: payload.id,
      },
    }),

    prisma.submission.count({
      where: {
        userId: payload.id,
        verdict: "AC",
      },
    }),

    prisma.submission.findMany({
      where: {
        userId: payload.id,
        verdict: "AC",
      },

      distinct: ["problemId"],

      select: {
        problemId: true,
      },
    }),
  ]);

  const solvedProblemCount = solvedProblems.length;

  const acceptanceRate =
    totalSubmissions > 0
      ? Math.round(
          (acceptedSubmissions /
            totalSubmissions) *
            100
        )
      : 0;

  const recentSubmissions =
    user.submissions;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Profile Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            {user.username}
          </h1>

          <p className="mt-2 text-gray-500">
            {user.email}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Problems Solved */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Problems Solved
            </p>

            <p className="mt-2 text-3xl font-bold">
              {solvedProblemCount}
            </p>
          </div>

          {/* Total Submissions */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Submissions
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalSubmissions}
            </p>
          </div>

          {/* Accepted */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Accepted
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {acceptedSubmissions}
            </p>
          </div>

          {/* Acceptance Rate */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Acceptance Rate
            </p>

            <p className="mt-2 text-3xl font-bold">
              {acceptanceRate}%
            </p>
          </div>

        </div>

        {/* Recent Submissions */}
        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-semibold">
                Recent Submissions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your 10 most recent submissions
              </p>
            </div>

            {totalSubmissions > 10 && (
              <Link
                href="/profile/submissions"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View all →
              </Link>
            )}

          </div>

          {/* No submissions */}
          {recentSubmissions.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-10 text-center">

              <p className="text-gray-500">
                You haven't made any submissions yet.
              </p>

              <Link
                href="/problems"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                Solve a Problem
              </Link>

            </div>
          ) : (

            /* Submission list */
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">

              {recentSubmissions.map(
                (submission, index) => (
                  <Link
                    key={submission.id}
                    href={`/problems/${submission.problemId}/submissions/${submission.id}`}
                    className="block"
                  >
                    <div
                      className={`flex items-center justify-between gap-4 p-5 transition hover:bg-gray-900 ${
                        index !==
                        recentSubmissions.length - 1
                          ? "border-b border-gray-800"
                          : ""
                      }`}
                    >

                      {/* Problem */}
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {submission.problem.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(
                            submission.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* Verdict */}
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getVerdictStyle(
                          submission.verdict
                        )}`}
                      >
                        {submission.verdict ??
                          "Unknown"}
                      </span>

                    </div>
                  </Link>
                )
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}