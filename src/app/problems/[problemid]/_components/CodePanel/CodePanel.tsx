"use client";

import { useState } from "react";

export default function CodePanel({ problemId }: { problemId: string }) {
  const [language, setLanguage] = useState("CPP");
  const [code, setCode] = useState("");

    const handleSubmit = async () => {
  await fetch("/api/submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problemId,
      language,
      code,
    }),
  });
};


  return (
    <div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="CPP">C++</option>
        <option value="JAVA">Java</option>
        <option value="PYTHON">Python</option>
        <option value="JAVASCRIPT">JavaScript</option>
      </select>

  <textarea
  value={code}
  onChange={(e) => setCode(e.target.value)}
  className="w-full h-[500px] border p-2"
/>

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}