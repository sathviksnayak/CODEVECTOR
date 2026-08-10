import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{
    problemid: string;
    submissionid: string;
  }>;
}) {
  const { problemid, submissionid } =
    await params;

  const submission =
    await prisma.submission.findUnique({
      where: {
        id: Number(submissionid),
      },
    });

  if (!submission) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Submission Details
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Problem #{problemid} · Submission #
            {submission.id}
          </p>
        </div>

        {/* Verdict */}
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-950 p-5">
          <p className="text-sm text-gray-500">
            Verdict
          </p>

          <p
            className={`mt-2 text-xl font-semibold ${
              submission.verdict === "AC"
                ? "text-green-400"
                : submission.verdict === "TLE"
                ? "text-yellow-400"
                : submission.verdict === "MLE"
                ? "text-orange-400"
                : "text-red-400"
            }`}
          >
            {submission.verdict}
          </p>
        </div>

        {/* Submission metadata */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Language
            </p>

            <p className="mt-1 font-medium">
              {submission.language}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Execution Time
            </p>

            <p className="mt-1 font-medium">
              {submission.executionTime ?? "-"} ms
            </p>
          </div>
        </div>

        {/* Code */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">
            Submitted Code
          </h2>

          <pre className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-950 p-5 font-mono text-sm leading-6 text-gray-300">
            {submission.code}
          </pre>
        </div>
      </div>
    </main>
  );
}