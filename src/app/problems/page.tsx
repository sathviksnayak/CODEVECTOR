import Link from "next/link";

async function getProblems() {
  const res = await fetch(
    "http://localhost:3000/api/problems",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <div>
      <h1>Problems</h1>

      {problems.map((problem: any) => (<Link key={problem.id} href={`/problems/${problem.id}`}>
        <div key={problem.id}>
          <h3>{problem.title}</h3>
          <p>{problem.difficulty}</p>
        </div>
        </Link>
      ))}
    </div>
  );
}