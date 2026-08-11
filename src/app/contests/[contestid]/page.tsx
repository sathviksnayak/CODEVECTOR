import Link from "next/link";

type ContestResponse = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  problems: {
    problem: {
      id: number;
      title: string;
      difficulty: string;
    };
  }[];
};

export default async function ContestPage({
  params,
}: {
  params: Promise<{ contestid: string }>;
}) {
  const { contestid } = await params;

  const res = await fetch(
    `/api/contests/${contestid}`,
    {
      cache: "no-store",
    }
  );

  if (res.status === 403) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold">
          You have not joined this contest
        </h1>

        <p className="mt-2 text-gray-400">
          Join the contest before accessing its problems.
        </p>

        <Link
          href="/contests"
          className="mt-6 inline-block rounded bg-gray-800 px-4 py-2 hover:bg-gray-700"
        >
          Back to Contests
        </Link>
      </div>
    );
  }

  if (!res.ok) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold">
          Contest not found
        </h1>
      </div>
    );
  }

  const contest: ContestResponse = await res.json();

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">
        {contest.title}
      </h1>

      <p className="mt-4 text-gray-400">
        Starts: {new Date(contest.startTime).toLocaleString()}
      </p>

      <p className="text-gray-400">
        Ends: {new Date(contest.endTime).toLocaleString()}
      </p>
              <Link
        href={`/contests/${contest.id}/leaderboard`}
        className="mt-6 inline-block rounded bg-gray-800 px-4 py-2 hover:bg-gray-700"
          >
        Leaderboard
      </Link>
      <div className="mt-8 space-y-4">
        {contest.problems.map((cp, index) => (
          <Link
            key={cp.problem.id}
            href={`/contests/${contestid}/problems/${cp.problem.id}`}
            className="block rounded border border-gray-700 p-4 hover:bg-gray-900"
          >
            <h2 className="font-semibold">
              {String.fromCharCode(65 + index)}.{" "}
              {cp.problem.title}
            </h2>

            <p className="text-sm text-gray-500">
              {cp.problem.difficulty}
            </p>
          </Link>
        ))}
      </div>


    </div>
  );
}