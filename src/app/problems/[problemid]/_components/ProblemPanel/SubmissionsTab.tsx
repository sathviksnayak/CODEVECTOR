import Link from "next/link";

type Submission = {
  id: number;
  verdict: string;
  aiAnalysis?: {
    status: string;
  } | null;
};

export default function SubmissionTab({
  submissions,
  problemId,
  onAnalyze,
}: {
  submissions: Submission[];
  problemId: number;
  onAnalyze: (submissionId: number) => void;
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

      case "CE":
        return "bg-red-500/10 text-red-400 border-red-500/20";

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
          <div
            key={submission.id}
            className="rounded-lg border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-600 hover:bg-gray-900"
          >
            <div className="flex items-center justify-between gap-4">

              {/* Submission */}
              <Link
                href={`/problems/${problemId}/submissions/${submission.id}`}
                className="flex-1"
              >
                <p className="text-sm text-gray-500">
                  Submission #{submission.id}
                </p>
              </Link>

              <div className="flex items-center gap-3">

                {/* Verdict */}
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${verdictStyle(
                    submission.verdict
                  )}`}
                >
                  {submission.verdict}
                </span>

                {/* AI Analysis */}
                {submission.verdict === "AC" && (
                  <button
                    onClick={() => onAnalyze(submission.id)}
                    className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20 hover:text-blue-300"
                  >
                    {submission.aiAnalysis?.status === "COMPLETED"
                      ? "View Analysis"
                      : "Analyze"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}