"use client";

import { useEffect, useState } from "react";

export default function ContestTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      setRemaining(Math.floor(diff / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (remaining === null) {
    return (
      <div className="rounded border border-gray-700 px-4 py-2">
        <span className="font-mono text-lg text-white">--:--:--</span>
      </div>
    );
  }

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const isLow = remaining <= 300; // last 5 minutes

  return (
    <div
      className={`rounded border px-4 py-2 ${
        isLow ? "border-red-600" : "border-gray-700"
      }`}
    >
      <span className="text-sm text-gray-400 mr-2">Time Left:</span>
      <span
        className={`font-mono text-lg font-semibold ${
          isLow ? "text-red-400" : "text-white"
        }`}
      >
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
        {String(s).padStart(2, "0")}
      </span>
    </div>
  );
}