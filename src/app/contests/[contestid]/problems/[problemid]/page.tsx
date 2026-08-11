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

 const url = new URL(
    `/api/contests/${contestid}/problems/${problemid}`,
    process.env.NEXT_PUBLIC_APP_URL
  );

  const res = await fetch(url, {
    cache: "no-store",
  });

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