import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if ( user.role!=="SUPERADMIN" && user.role !== "ADMIN" ) {
    redirect("/");
  }

  const [
    problemCount,
    contestCount,
    userCount,
    submissionCount,
  ] = await Promise.all([
    prisma.problem.count(),
    prisma.contest.count(),
    prisma.user.count(),
    prisma.submission.count(),
  ]);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-1 text-4xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome back, {user.username}.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Problems
            </p>

            <p className="mt-2 text-3xl font-bold">
              {problemCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Contests
            </p>

            <p className="mt-2 text-3xl font-bold">
              {contestCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {userCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-500">
              Submissions
            </p>

            <p className="mt-2 text-3xl font-bold">
              {submissionCount}
            </p>
          </div>
        </div>

{/* Management */}
<section className="mt-10">
  <h2 className="mb-4 text-xl font-semibold">
    Management
  </h2>

  <div className="grid gap-4 md:grid-cols-2">

    {/* Problems */}
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Problems
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage coding problems.
          </p>
        </div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
          {problemCount}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/problems"
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-900"
        >
          Manage Problems
        </Link>

        <Link
          href="/admin/problems/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Create Problem
        </Link>
      </div>
    </div>

    {/* Contests */}
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Contests
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage programming contests.
          </p>
        </div>

        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
          {contestCount}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/contests"
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-900"
        >
          Manage Contests
        </Link>

        <Link
          href="/admin/contests/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Create Contest
        </Link>
      </div>
    </div>

    {/* Users */}
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Users
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            View users and manage their roles.
          </p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
          {userCount}
        </span>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/users"
          className="inline-block rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-900"
        >
          Manage Users
        </Link>
      </div>
    </div>

  </div>
</section>
        {/* Account */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">
            Current User
          </h2>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {user.username}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {user.email}
                </p>
              </div>

              <span className="w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                ADMIN
              </span>
            </div>
          </div>
        </section>

        {/* Back to platform */}
        <div className="mt-10 border-t border-gray-800 pt-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-white"
          >
            ← Back to CodeVector
          </Link>
        </div>

      </div>
    </main>
  );
}