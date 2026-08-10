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

export default async function SubmissionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  const submissions = await prisma.submission.findMany({
    where: {
      userId: payload.id,
    },
    include: {
      problem: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            ← Back to Profile
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Submission History
          </h1>

          <p className="mt-2 text-gray-500">
            All your submissions
          </p>
        </div>

        {/* Empty state */}
        {submissions.length === 0 ? (
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
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">

            {submissions.map((submission, index) => (
              <Link
                key={submission.id}
                href={`/problems/${submission.problemId}/submissions/${submission.id}`}
                className="block"
              >
                <div
                  className={`flex items-center justify-between gap-4 p-5 transition hover:bg-gray-900 ${
                    index !== submissions.length - 1
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
                    {submission.verdict ?? "Unknown"}
                  </span>
                </div>
              </Link>
            ))}

          </div>
        )}

        {submissions.length > 0 && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {submissions.length} submission
            {submissions.length !== 1 ? "s" : ""}
          </p>
        )}

      </div>
    </main>
  );
}