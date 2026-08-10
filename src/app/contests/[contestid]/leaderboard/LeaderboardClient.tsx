"use client";

import { useEffect, useState } from "react";

type LeaderboardEntry = {
  userId: number;
  username: string;
  solved: number;
  score: number;
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
    useState<LeaderboardEntry[]>(initialLeaderboard);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let startTimer: NodeJS.Timeout | null = null;
    let endTimer: NodeJS.Timeout | null = null;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    async function fetchLeaderboard() {
      // Contest hasn't started
      if (Date.now() < start) {
        return;
      }

      // Contest has ended
      if (Date.now() >= end) {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }

        return;
      }

      try {
        const res = await fetch(
          `/api/contests/${contestId}/leaderboard`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch leaderboard");
          return;
        }

        const data = await res.json();

        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
      }
    }

    const now = Date.now();

    // Contest is currently running
    if (now >= start && now < end) {
      interval = setInterval(fetchLeaderboard, 10000);
    }

    // Contest hasn't started yet
    else if (now < start) {
      startTimer = setTimeout(() => {
        fetchLeaderboard();

        interval = setInterval(
          fetchLeaderboard,
          10000
        );
      }, start - now);
    }

    // Stop polling exactly when contest ends
    if (now < end) {
      endTimer = setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }, end - now);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (startTimer) clearTimeout(startTimer);
      if (endTimer) clearTimeout(endTimer);
    };
  }, [contestId, startTime, endTime]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700">
      <table className="w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-4 text-left">Rank</th>
            <th className="px-6 py-4 text-left">User</th>
            <th className="px-6 py-4 text-center">Solved</th>
            <th className="px-6 py-4 text-center">Score</th>
            <th className="px-6 py-4 text-center">Penalty</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-gray-500"
              >
                No participants yet.
              </td>
            </tr>
          ) : (
            leaderboard.map((entry, index) => (
              <tr
                key={entry.userId}
                className="border-t border-gray-800 hover:bg-gray-900"
              >
                <td className="px-6 py-4 font-semibold">
                  #{index + 1}
                </td>

                <td className="px-6 py-4">
                  {entry.username}
                </td>

                <td className="px-6 py-4 text-center">
                  {entry.solved}
                </td>

                <td className="px-6 py-4 text-center font-semibold">
                  {entry.score}
                </td>

                <td className="px-6 py-4 text-center text-gray-400">
                  {entry.penalty}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}