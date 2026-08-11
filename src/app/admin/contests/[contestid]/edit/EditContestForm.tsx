"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Problem = {
  id: number;
  title: string;
  difficulty: string;
};

type ContestProblem = {
  id: number;
  problemId: number;
};

type Contest = {
  id: number;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  problems: ContestProblem[];
};

export default function EditContestForm({
  contest,
  problems,
}: {
  contest: Contest;
  problems: Problem[];
}) {
  const router = useRouter();

  function formatDateTime(date: Date | string) {
    const value = new Date(date);

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const [title, setTitle] = useState(contest.title);

  const [startTime, setStartTime] = useState(
    formatDateTime(contest.startTime)
  );

  const [endTime, setEndTime] = useState(
    formatDateTime(contest.endTime)
  );

  // IMPORTANT:
  // contest.problems contains ContestProblem records.
  // We need their problemId, not their own id.
  const [selectedProblems, setSelectedProblems] = useState<number[]>(
    contest.problems.map((cp) => cp.problemId)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleProblem(problemId: number) {
    setSelectedProblems((prev) => {
      if (prev.includes(problemId)) {
        return prev.filter((id) => id !== problemId);
      }

      return [...prev, problemId];
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (selectedProblems.length === 0) {
      setError("A contest must contain at least one problem.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      setError("End time must be after start time.");
      return;
    }

    if (start <= new Date()) {
      setError("The contest must still be upcoming.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/contests/${contest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            startTime,
            endTime,
            problemIds: selectedProblems,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update contest");
        return;
      }

      setSuccess("Contest updated successfully.");

      router.refresh();

      setTimeout(() => {
        router.push("/admin/contests");
      }, 500);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Contest Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Start / End */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Start Time
          </label>

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            End Time
          </label>

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Problems */}
      <div>
        <div className="mb-3">
          <h2 className="text-xl font-semibold">
            Problems
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the problems included in this contest.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950 p-4">
          {problems.length === 0 ? (
            <p className="text-sm text-gray-500">
              No problems available.
            </p>
          ) : (
            problems.map((problem) => (
              <label
                key={problem.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-900"
              >
                <input
                  type="checkbox"
                  checked={selectedProblems.includes(problem.id)}
                  onChange={() => toggleProblem(problem.id)}
                />

                <div>
                  <p className="font-medium">
                    {problem.title}
                  </p>

                  <p className="text-xs text-gray-500">
                    {problem.difficulty}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {selectedProblems.length} problem
          {selectedProblems.length !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/contests")}
          className="rounded-lg border border-gray-700 px-6 py-3 font-medium hover:bg-gray-900"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}