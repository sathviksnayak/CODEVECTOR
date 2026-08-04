"use client";
import DescriptionTab from "./DescriptionTab";
import TestCasesTab from "./TestCasesTab";
import SubmissionTab from "./SubmissionsTab";
import { useState } from "react";

export default function ProblemTabs({ data,submissions }: { data: any; submissions: any[] }) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div>
<div className="flex gap-4 border-b mb-4">
  <button
    onClick={() => setActiveTab("description")}
  >
    Description
  </button>

  <button
    onClick={() => setActiveTab("testcases")}
  >
    Test Cases
  </button>

  <button
    onClick={() => setActiveTab("submissions")}
  >
    Submissions
  </button>
</div>

      <div>
        {activeTab === "description" && (
          <DescriptionTab data={data} />
        )}

        {activeTab === "testcases" && (
          <TestCasesTab testCases={data.testCases} />
        )}


        {activeTab === "submissions" && (
          <SubmissionTab problemId={data.id} submissions={submissions} />
        )}
      </div>
    </div>
  );
}