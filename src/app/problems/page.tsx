import Link from "next/link";

async function getProblems() {
  const res = await fetch(
    "/api/problems",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch problems");
  }

  return res.json();
}

function difficultyStyle(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-green-500/10 text-green-400 border-green-500/20";

    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

    case "HARD":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Problems
          </h1>

          <p className="mt-2 text-gray-400">
            Practice programming problems and improve your
            problem-solving skills.
          </p>
        </div>

        {/* Problem list */}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
          
          {/* Header row */}
          <div className="grid grid-cols-[70px_1fr_140px] border-b border-gray-800 bg-gray-900/60 px-6 py-4 text-sm font-medium text-gray-400">
            <span>#</span>
            <span>Problem</span>
            <span className="text-right">
              Difficulty
            </span>
          </div>

          {problems.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No problems available.
            </div>
          ) : (
            problems.map(
              (problem: any, index: number) => (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.id}`}
                  className="grid grid-cols-[70px_1fr_140px] items-center border-b border-gray-800 px-6 py-5 transition hover:bg-gray-900 last:border-b-0"
                >
                  {/* Number */}
                  <span className="text-sm text-gray-500">
                    {index + 1}
                  </span>

                  {/* Problem */}
                  <div>
                    <h2 className="font-medium text-white">
                      {problem.title}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Problem #{problem.id}
                    </p>
                  </div>

                  {/* Difficulty */}
                  <div className="flex justify-end">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyStyle(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                </Link>
              )
            )
          )}
        </div>

        {/* Count */}
        {problems.length > 0 && (
          <p className="mt-4 text-sm text-gray-500">
            {problems.length} problem
            {problems.length !== 1 ? "s" : ""} available
          </p>
        )}
      </div>
    </main>
  );
}