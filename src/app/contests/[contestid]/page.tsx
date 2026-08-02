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
    `http://localhost:3000/api/contests/${contestid}`,
    {
      cache: "no-store",
    }
  );

 const contest: ContestResponse = await res.json();
 

  if (!contest) {
    return <div>Contest not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        {contest.title}
      </h1>

<p className="mt-2 text-gray-500">
  Starts: {new Date(contest.startTime).toLocaleString()}
</p>

<p className="text-gray-500">
  Ends: {new Date(contest.endTime).toLocaleString()}
</p>

      <div className="mt-8 space-y-4">
        {contest.problems.map((cp, index) => (
          <Link
            key={cp.problem.id}
            href={`/contests/${contestid}/problems/${cp.problem.id}`}
            className="block rounded border p-4 hover:bg-gray-100"
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