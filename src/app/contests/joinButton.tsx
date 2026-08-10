"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ contestId }: { contestId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function joinContest() {
    setLoading(true);

    const response = await fetch(`/api/contests/${contestId}/join`, {
      method: "POST",
    });

    if (response.ok) {
      router.push(`/contests/${contestId}`);
      router.refresh();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to join contest");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={joinContest}
      disabled={loading}
      className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Joining..." : "Join Contest"}
    </button>
  );
}