import ProblemPageContent from "@/app/problems/[problemid]/ProblemPageContent";


async function ContestProblemPage({
  params,
}: {
  params: Promise<{
    contestid: string;
    problemid: string;
  }>;
}) {
  const { contestid, problemid } = await params;

  const res = await fetch(
    `http://localhost:3000/api/contests/${contestid}/problems/${problemid}`,
    {
      cache: "no-store",
    }
  );

  const problem = await res.json();

  return (
  <ProblemPageContent problem={problem} />
  );
}

export default ContestProblemPage;