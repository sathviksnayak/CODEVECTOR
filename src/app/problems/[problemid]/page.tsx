import ProblemPageContent from "./ProblemPageContent";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ problemid: string }>;
}) {
  const { problemid } = await params;

  const problemId = Number(problemid);

  if (!Number.isInteger(problemId)) {
    notFound();
  }

  const problemUrl = new URL(
    `/api/problems/${problemId}`,
    process.env.NEXT_PUBLIC_APP_URL
  );

  const problemRes = await fetch(problemUrl, {
    cache: "no-store",
  });

  if (!problemRes.ok) {
    notFound();
  }

  const problem = await problemRes.json();

  const submissionsUrl = new URL(
    `/api/submissions?problemId=${problemId}`,
    process.env.NEXT_PUBLIC_APP_URL
  );

  const submissionsRes = await fetch(submissionsUrl, {
    cache: "no-store",
  });

  if (!submissionsRes.ok) {
    throw new Error("Failed to fetch submissions");
  }

  const submissions = await submissionsRes.json();

  return (
    <ProblemPageContent
      problem={problem}
      submissions={submissions}
    />
  );
}