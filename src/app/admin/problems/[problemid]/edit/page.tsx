import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { redirect, notFound } from "next/navigation";
import EditProblemForm from "./EditProblemForm";

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ problemid: string }>;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if ( user.role!=="SUPERADMIN" && user.role !== "ADMIN" ) {
    redirect("/");
  }

  const { problemid } = await params;

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(problemid),
    },
    include: {
      testCases: true,
    },
  });

  if (!problem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">
          Edit Problem
        </h1>

        <EditProblemForm problem={problem} />
      </div>
    </main>
  );
}