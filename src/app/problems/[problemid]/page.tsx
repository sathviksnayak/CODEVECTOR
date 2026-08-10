import ProblemPageContent from "./ProblemPageContent";

export default async function Page({
  params,
}: {
  params: Promise<{ problemid: string }>;
}) {
  const { problemid } = await params;

  const problemRes = await fetch(
    `http://localhost:3000/api/problems/${problemid}`,
    {
      cache: "no-store",
    }
  );

  if (!problemRes.ok) {
    throw new Error("Failed to fetch problem");
  }

  const data = await problemRes.json();

  const submissionsRes = await fetch(
    `http://localhost:3000/api/submissions?problemId=${problemid}`,
    {
      cache: "no-store",
    }
  );

  if (!submissionsRes.ok) {
    throw new Error("Failed to fetch submissions");
  }

  const submissionsResponse = await submissionsRes.json();

  return (
    <ProblemPageContent
      problem={data}
      submissions={submissionsResponse}
    />
  );
}