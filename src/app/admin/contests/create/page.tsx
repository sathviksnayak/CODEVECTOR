"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Problem = {
  id: number;
  title: string;
  difficulty: string;
};

export default function CreateContestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<number[]>([]);

  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch("/api/admin/problems");

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load problems");
          return;
        }

        setProblems(data);
      } catch {
        setError("Failed to load problems");
      } finally {
        setLoadingProblems(false);
      }
    }

    fetchProblems();
  }, []);

  function toggleProblem(problemId: number) {
    setSelectedProblems((current) => {
      if (current.includes(problemId)) {
        return current.filter((id) => id !== problemId);
      }

      return [...current, problemId];
    });
  }

  async function createContest(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Contest title is required");
      return;
    }

    if (!startTime || !endTime) {
      setError("Start time and end time are required");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time");
      return;
    }

    if (selectedProblems.length === 0) {
      setError("Select at least one problem");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/contests",
        {
          method: "POST",
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
        setError(
          data.error || "Failed to create contest"
        );
        return;
      }

      router.push("/admin/contests");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">
          Create Contest
        </h1>

        <p className="mt-2 text-gray-400">
          Create a contest and select the problems
          participants will solve.
        </p>

        <form
          onSubmit={createContest}
          className="mt-8 space-y-8"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block font-medium">
              Contest Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Weekly Contest #1"
              className="w-full rounded border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Start Time
              </label>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
                className="w-full rounded border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                End Time
              </label>

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
                className="w-full rounded border border-gray-700 bg-gray-900 p-3 text-white outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Problems */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Problems
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Select the problems that should appear
                in this contest.
              </p>
            </div>

            {loadingProblems ? (
              <div className="rounded border border-gray-700 p-5 text-gray-400">
                Loading problems...
              </div>
            ) : problems.length === 0 ? (
              <div className="rounded border border-gray-700 p-5 text-gray-400">
                No problems available. Create a
                problem first.
              </div>
            ) : (
              <div className="space-y-3">
                {problems.map((problem) => {
                  const selected =
                    selectedProblems.includes(
                      problem.id
                    );

                  return (
                    <label
                      key={problem.id}
                      className={`flex cursor-pointer items-center justify-between rounded border p-4 transition ${
                        selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleProblem(
                              problem.id
                            )
                          }
                          className="h-4 w-4"
                        />

                        <div>
                          <p className="font-semibold">
                            {problem.title}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            Problem #{problem.id}
                          </p>
                        </div>
                      </div>

                      <span className="rounded bg-gray-800 px-3 py-1 text-sm">
                        {problem.difficulty}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected count */}
          <div className="text-sm text-gray-400">
            {selectedProblems.length} problem
            {selectedProblems.length !== 1
              ? "s"
              : ""}{" "}
            selected
          </div>

          {/* Error */}
          {error && (
            <div className="rounded border border-red-600 bg-red-900/30 p-3 text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || loadingProblems}
            className="rounded bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Contest"}
          </button>
        </form>
      </div>
    </div>
  );
}