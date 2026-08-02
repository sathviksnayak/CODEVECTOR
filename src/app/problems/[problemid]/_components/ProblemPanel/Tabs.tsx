"use client";
import DescriptionTab from "./DescriptionTab";
import TestCasesTab from "./TestCasesTab";
import { useState } from "react";

export default function ProblemTabs({ data }: { data: any }) {
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
</div>

      <div>
        {activeTab === "description" && (
          <DescriptionTab data={data} />
        )}

        {activeTab === "testcases" && (
          <TestCasesTab testCases={data.testCases} />
        )}
      </div>
    </div>
  );
}