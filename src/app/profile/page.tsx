import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    include: {
      submissions: {
        include: {
          problem: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalSubmissions = user.submissions.length;

  const acceptedSubmissions = user.submissions.filter(
    (submission) => submission.verdict === "AC"
  ).length;

  const solvedProblems = new Set(
    user.submissions
      .filter((submission) => submission.verdict === "AC")
      .map((submission) => submission.problemId)
  ).size;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-bold">
        {user.username}
      </h1>

      <p className="mb-8 text-gray-500">
        {user.email}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded border p-4">
          <p className="text-gray-500">Problems Solved</p>
          <p className="text-2xl font-bold">{solvedProblems}</p>
        </div>

        <div className="rounded border p-4">
          <p className="text-gray-500">Total Submissions</p>
          <p className="text-2xl font-bold">{totalSubmissions}</p>
        </div>

        <div className="rounded border p-4">
          <p className="text-gray-500">Accepted</p>
          <p className="text-2xl font-bold">{acceptedSubmissions}</p>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        Recent Submissions
      </h2>

      <div className="space-y-3">
        {user.submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/problems/${submission.problemId}/submissions/${submission.id}`}
          >
            <div className="flex justify-between rounded border p-4 hover:bg-gray-100">
              <div>
                <p>{submission.problem.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>

              <span
                className={
                  submission.verdict === "AC"
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
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