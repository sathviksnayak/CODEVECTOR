import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import UserActions from "./UserActions";

export default async function AdminUsersPage() {
  const currentUser = await getUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (
    currentUser.role !== "SUPERADMIN" &&
    currentUser.role !== "ADMIN"
  ) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Manage Users
          </h1>

          <p className="mt-2 text-gray-500">
            View users, manage roles, and control account access.
          </p>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">

          {/* Table header */}
          <div className="grid grid-cols-6 border-b border-gray-800 bg-gray-900/60 px-6 py-4 text-sm font-medium text-gray-400">
            <div>Username</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Submissions</div>
            <div>Action</div>
          </div>

          {/* Users */}
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-6 items-center border-b border-gray-800 px-6 py-5 last:border-b-0 hover:bg-gray-900/40"
            >

              {/* Username */}
              <div>
                <p className="font-medium">
                  {user.username}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  ID: {user.id}
                </p>
              </div>

              {/* Email */}
              <div className="truncate pr-4 text-gray-400">
                {user.email}
              </div>

              {/* Role */}
              <div>
                <span
                  className={
                    user.role === "SUPERADMIN"
                      ? "rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400"
                      : user.role === "ADMIN"
                        ? "rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400"
                        : "rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-400"
                  }
                >
                  {user.role}
                </span>
              </div>

              {/* Account status */}
              <div>
                {user.banned ? (
                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                    BANNED
                  </span>
                ) : (
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Submission count */}
              <div className="text-gray-400">
                {user._count.submissions}
              </div>

              {/* Actions */}
              <div>
<UserActions
  userId={user.id}
  currentRole={user.role}
  isCurrentUser={user.id === currentUser.id}
  isBanned={user.banned}
  currentUserRole={currentUser.role}
/>
              </div>

            </div>
          ))}
        </div>

        {/* Count */}
        <p className="mt-5 text-sm text-gray-500">
          {users.length} user
          {users.length !== 1 ? "s" : ""}
        </p>

      </div>
    </main>
  );
}