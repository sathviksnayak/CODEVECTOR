import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Problems
          </h1>

          <Link
            href="/admin/problems/create"
            className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            + Create Problem
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="rounded border border-gray-700 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {problem.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    ID: {problem.id}
                  </p>
                </div>

                <span className="rounded bg-gray-800 px-3 py-1 text-sm">
                  {problem.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}