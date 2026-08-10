"use client";

import { useState } from "react";
import DescriptionTab from "./DescriptionTab";
import TestCasesTab from "./TestCasesTab";
import SubmissionTab from "./SubmissionsTab";

export default function ProblemTabs({
  data,
  submissions = [],
  showSubmissions = true,
}: {
  data: any;
  submissions?: any[];
  showSubmissions?: boolean;
}) {
  const [activeTab, setActiveTab] =
    useState("description");

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-800">
        <button
          onClick={() =>
            setActiveTab("description")
          }
          className={`px-5 py-3 text-sm font-medium transition ${
            activeTab === "description"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Description
        </button>

        <button
          onClick={() =>
            setActiveTab("testcases")
          }
          className={`px-5 py-3 text-sm font-medium transition ${
            activeTab === "testcases"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Test Cases
        </button>

        {showSubmissions && (
          <button
            onClick={() =>
              setActiveTab("submissions")
            }
            className={`px-5 py-3 text-sm font-medium transition ${
              activeTab === "submissions"
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Submissions
          </button>
        )}
      </div>

      {/* Tab content */}
<div className="px-6 py-6">
  {activeTab === "description" && (
    <DescriptionTab data={data} />
  )}

  {activeTab === "testcases" && (
    <TestCasesTab testCases={data.testCases} />
  )}

  {showSubmissions && activeTab === "submissions" && (
    <SubmissionTab
      problemId={data.id}
      submissions={submissions}
    />
  )}
</div>
    </div>
  );
}