"use client";

import { useState,useEffect } from "react";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [problems, setProblems] = useState<any[]>([]);
const [selectedProblems, setSelectedProblems] = useState<number[]>([]);

useEffect(() => {
  async function loadProblems() {
    const res = await fetch("/api/problems");
    const data = await res.json();
    setProblems(data);
  }

  loadProblems();
}, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    const response = await fetch("/api/admin/contests", {
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
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Contest created successfully");
      setTitle("");
      setStartTime("");
      setEndTime("");
    } else {
      setMessage(data.error || "Failed to create contest");
    }
  }

  return (
    
    <main className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-2xl">

        <h1 className="mb-8 text-3xl font-bold">
          Admin Dashboard
        </h1>

        <div className="rounded-lg border border-gray-700 bg-gray-950 p-6">

          <h2 className="mb-6 text-xl font-semibold">
            Create Contest
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm">
                Contest Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly Contest #2"
                className="w-full rounded border border-gray-700 bg-gray-900 p-3 text-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Start Time
              </label>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded border border-gray-700 bg-gray-900 p-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                End Time
              </label>

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded border border-gray-700 bg-gray-900 p-3"
                required
              />
            </div>

            <div>
  <label className="mb-3 block text-sm font-semibold">
    Select Problems
  </label>

  <div className="space-y-2 rounded border border-gray-700 p-4">
    {problems.map((problem) => (
      <label
        key={problem.id}
        className="flex items-center gap-3 rounded p-2 hover:bg-gray-900"
      >
        <input
          type="checkbox"
          checked={selectedProblems.includes(problem.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProblems((prev) => [
                ...prev,
                problem.id,
              ]);
            } else {
              setSelectedProblems((prev) =>
                prev.filter((id) => id !== problem.id)
              );
            }
          }}
        />

        <span>
          {problem.title} ({problem.difficulty})
        </span>
      </label>
    ))}
  </div>
</div>

            <button
              type="submit"
              className="w-full rounded bg-blue-600 p-3 font-semibold hover:bg-blue-700"
            >
              Create Contest
            </button>

          </form>

          {message && (
            <p className="mt-4 text-gray-300">
              {message}
            </p>
          )}

        </div>
      </div>
    </main>
  );
}