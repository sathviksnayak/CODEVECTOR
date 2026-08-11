import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

export default async function AdminProblemsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const problems = await prisma.problem.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Problems
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your coding problems.
            </p>
          </div>

          <Link
            href="/admin/problems/create"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
          >
            + Create Problem
          </Link>
        </div>

        {/* Problems */}
        <div className="mt-8 space-y-4">
          {problems.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-8 text-center text-gray-500">
              No problems found.
            </div>
          ) : (
            problems.map((problem) => (
              <div
                key={problem.id}
                className="rounded-xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-700"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Problem info */}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {problem.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      ID: {problem.id}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium">
                      {problem.difficulty}
                    </span>

                    <Link
                      href={`/admin/problems/${problem.id}/edit`}
                      className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}