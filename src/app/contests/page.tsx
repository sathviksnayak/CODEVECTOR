import Link from "next/link";

async function getContests() {
  const res = await fetch(
    "http://localhost:3000/api/contests",
    {
      cache: "no-store",
    }
  );

  return res.json();
}


function getStatus(
  start: Date,
  end: Date
) {
  const now = new Date();

  if (now < start) return "Upcoming";

  if (now > end) return "Ended";

  return "Live";
}


export default async function ProblemsPage() {
  const contests = await getContests();

  return (
    <div>
      <h1>Contests</h1>

      {contests.map((contest: any) => (<Link key={contest.id} href={`/contests/${contest.id}`}>
        <div key={contest.id} >
          <h3>{contest.title}</h3>
            <p>Status: {getStatus(new Date(contest.startTime), new Date(contest.endTime))}</p>
            <p>StartTime: {contest.startTime}</p>
            <p>EndTime: {contest.endTime}</p>
        </div>
        </Link>
      ))}
    </div>
  );
}