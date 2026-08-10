"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Contest = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
};

export default function AdminContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetch("/api/admin/contests");
        const data = await response.json();

        if (response.ok) {
          setContests(data);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
  }, []);

  function getStatus(
    startTime: string,
    endTime: string
  ) {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "Upcoming";
    if (now > end) return "Ended";
    return "Live";
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Manage Contests
            </h1>

            <p className="mt-2 text-gray-400">
              Create and manage coding contests.
            </p>
          </div>

          <Link
            href="/admin/contests/create"
            className="rounded bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            + Create Contest
          </Link>
        </div>

        {/* Contest List */}
        {loading ? (
          <div className="text-gray-400">
            Loading contests...
          </div>
        ) : contests.length === 0 ? (
          <div className="rounded border border-gray-700 p-6 text-gray-400">
            No contests created yet.
          </div>
        ) : (
          <div className="space-y-4">
            {contests.map((contest) => {
              const status = getStatus(
                contest.startTime,
                contest.endTime
              );

              return (
                <div
                  key={contest.id}
                  className="rounded border border-gray-700 bg-gray-900 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {contest.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        Contest #{contest.id}
                      </p>
                    </div>

                    <span
                      className={`rounded px-3 py-1 text-sm ${
                        status === "Live"
                          ? "bg-green-900 text-green-400"
                          : status === "Upcoming"
                          ? "bg-yellow-900 text-yellow-400"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                    <div>
                      <span className="text-gray-500">
                        Starts:
                      </span>{" "}
                      {new Date(
                        contest.startTime
                      ).toLocaleString()}
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Ends:
                      </span>{" "}
                      {new Date(
                        contest.endTime
                      ).toLocaleString()}
                    </div>
                  </div>

                  {/* Later */}
                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/contests/${contest.id}`}
                      className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/contests/${contest.id}/edit`}
                      className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}