import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { redirect, notFound } from "next/navigation";
import EditContestForm from "./EditContestForm";

export default async function EditContestPage({
  params,
}: {
  params: Promise<{ contestid: string }>;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const { contestid } = await params;

  const contestId = Number(contestid);

  if (!Number.isInteger(contestId)) {
    notFound();
  }

  const contest = await prisma.contest.findUnique({
    where: {
      id: contestId,
    },
    include: {
      problems: true,
    },
  });

  if (!contest) {
    notFound();
  }

  /*
   * Only upcoming contests can be edited.
   */
  if (new Date() >= new Date(contest.startTime)) {
    redirect("/admin/contests");
  }

  /*
   * Fetch all problems that can potentially
   * be added to the contest.
   */
  const problems = await prisma.problem.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Edit Contest
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update the contest details and selected problems.
          </p>
        </div>

        <EditContestForm
          contest={contest}
          problems={problems}
        />
      </div>
    </main>
  );
}