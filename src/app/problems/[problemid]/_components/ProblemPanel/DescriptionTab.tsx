type Problem = {
  title: string;
  difficulty: string;
  statement: string;
  example: string;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
};

export default function DescriptionTab({
  data,
}: {
  data: Problem;
}) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-white">
            {data.title}
          </h1>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${difficultyStyle(
              data.difficulty
            )}`}
          >
            {data.difficulty}
          </span>
        </div>
      </div>

      {/* Description */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">
          Description
        </h2>

        <p className="whitespace-pre-wrap leading-7 text-gray-300">
          {data.statement}
        </p>
      </section>

      {/* Example */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">
          Example
        </h2>

        <pre className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-950 p-5 font-mono text-sm leading-6 text-gray-300">
          {data.example}
        </pre>
      </section>

      {/* Constraints */}
      <section>
        <h2 className="mb-3 text-xl font-semibold">
          Constraints
        </h2>

        <pre className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-950 p-5 font-mono text-sm leading-6 text-gray-300">
          {data.constraints}
        </pre>
      </section>

      {/* Limits */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
          <p className="text-sm text-gray-500">
            Time Limit
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.timeLimit} ms
          </p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
          <p className="text-sm text-gray-500">
            Memory Limit
          </p>

          <p className="mt-1 text-lg font-semibold">
            {data.memoryLimit} MB
          </p>
        </div>
      </section>
    </div>
  );
}