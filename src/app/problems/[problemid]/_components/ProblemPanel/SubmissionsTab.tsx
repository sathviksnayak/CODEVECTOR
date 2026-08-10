import Link from "next/link";

type Submission = {
  id: number;
  verdict: string;
};

export default function SubmissionTab({
  submissions,
  problemId,
}: {
  submissions: Submission[];
  problemId: number;
}) {
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <p className="text-gray-500">
          No submissions found for this problem.
        </p>
      </div>
    );
  }

  function verdictStyle(verdict: string) {
    switch (verdict) {
      case "AC":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "WA":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "TLE":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "MLE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";

      case "RE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Submissions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your submissions for this problem
        </p>
      </div>

      <div className="space-y-3">
        {submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/problems/${problemId}/submissions/${submission.id}`}
            className="block rounded-lg border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-600 hover:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Submission #{submission.id}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${verdictStyle(
                  submission.verdict
                )}`}
              >
                {submission.verdict}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}