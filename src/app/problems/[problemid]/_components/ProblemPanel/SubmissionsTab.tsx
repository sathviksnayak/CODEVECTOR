
import Link from "next/link";

export  default  function submissiontab({submissions,problemId}:{submissions: any[],problemId: number}) {



if(!Array.isArray(submissions) || submissions.length === 0) {
  return (
    <div className="flex justify-center items-center h-full">
      <p>No submissions found for this problem.</p>
    </div>
  );
}
  return (
    <div>
        <h2 className="text-2xl font-bold mb-4">Submissions</h2>
{submissions.map((submission: any) => (
  <Link
    key={submission.id}
    href={`/problems/${problemId}/submissions/${submission.id}`}
  >
    <div className="border p-4 mb-4 rounded">
        <p><strong>Submission ID:</strong> {submission.id}</p>
        <p><strong>Verdict:</strong> {submission.verdict}</p>
    </div>
  </Link>
))}
    </div>
  )




}