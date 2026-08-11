import ContestProblemPageContent from "./ContestProblemPageContent";

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
    `/api/contests/${contestid}/problems/${problemid}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return <div>Problem not found</div>;
  }

  const data = await res.json();

  return (
    <ContestProblemPageContent
      problem={data.problem}
      contest={data.contest}
      contestId={Number(contestid)}
    />
  );
}

export default ContestProblemPage;