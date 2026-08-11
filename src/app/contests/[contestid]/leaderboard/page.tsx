import LeaderboardClient from "./LeaderboardClient";

async function getLeaderboard(
  contestId: string
) {
  const res = await fetch(
    `http://localhost:3000/api/contests/${contestId}/leaderboard`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch leaderboard"
    );
  }

  return res.json();
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{
    contestid: string;
  }>;
}) {
  const { contestid } = await params;

  const data =
    await getLeaderboard(contestid);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-4xl font-bold">
          {data.contest.title}
        </h1>

        <p className="mt-2 text-gray-400">
          Contest Leaderboard
        </p>

        <div className="mt-10">
          <LeaderboardClient
            contestId={contestid}
            initialLeaderboard={
              data.leaderboard
            }
            startTime={
              data.contest.startTime
            }
            endTime={
              data.contest.endTime
            }
          />
        </div>
      </div>
    </div>
  );
}