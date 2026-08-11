"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  userId: number;
  username: string;
  solved: number;
  penalty: number;
};

type Props = {
  contestId: string;
  initialLeaderboard: LeaderboardEntry[];
  startTime: string;
  endTime: string;
};

export default function LeaderboardClient({
  contestId,
  initialLeaderboard,
  startTime,
  endTime,
}: Props) {
  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>(
      initialLeaderboard
    );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let startTimer: NodeJS.Timeout | null = null;
    let endTimer: NodeJS.Timeout | null = null;

    const start = new Date(
      startTime
    ).getTime();

    const end = new Date(
      endTime
    ).getTime();

    async function fetchLeaderboard() {
      try {
        const res = await fetch(
          `/api/contests/${contestId}/leaderboard`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          console.error(
            "Failed to fetch leaderboard"
          );
          return;
        }

        const data = await res.json();

        setLeaderboard(
          data.leaderboard
        );
      } catch (error) {
        console.error(
          "Leaderboard fetch error:",
          error
        );
      }
    }

    const now = Date.now();

    /*
     * Contest is currently live.
     */
    if (now >= start && now < end) {
      /*
       * Fetch immediately instead of waiting
       * 10 seconds for the first update.
       */
      fetchLeaderboard();

      interval = setInterval(
        fetchLeaderboard,
        10000
      );
    }

    /*
     * Contest hasn't started.
     */
    else if (now < start) {
      startTimer = setTimeout(() => {
        fetchLeaderboard();

        interval = setInterval(
          fetchLeaderboard,
          10000
        );
      }, start - now);
    }

    /*
     * Fetch one final leaderboard exactly
     * when the contest ends.
     */
    if (now < end) {
      endTimer = setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }

        fetchLeaderboard();
      }, end - now);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }

      if (startTimer) {
        clearTimeout(startTimer);
      }

      if (endTimer) {
        clearTimeout(endTimer);
      }
    };
  }, [
    contestId,
    startTime,
    endTime,
  ]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
      <table className="w-full">
        <thead className="bg-gray-900/70">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
              Rank
            </th>

            <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
              User
            </th>

            <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">
              Solved
            </th>

            <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">
              Penalty
            </th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-gray-500"
              >
                No submissions yet.
              </td>
            </tr>
          ) : (
            leaderboard.map(
              (entry, index) => (
                <tr
                  key={entry.userId}
                  className="border-t border-gray-800 transition hover:bg-gray-900/60"
                >
                  <td className="px-6 py-4 font-semibold">
                    #{index + 1}
                  </td>

                  <td className="px-6 py-4">
                    {entry.username}
                  </td>

                  <td className="px-6 py-4 text-center font-medium">
                    {entry.solved}
                  </td>

                  <td className="px-6 py-4 text-center text-gray-400">
                    {entry.penalty}
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}