import CodePanel from "@/app/problems/[problemid]/_components/CodePanel/CodePanel";
import ProblemTabs from "@/app/problems/[problemid]/_components/ProblemPanel/Tabs";
import ContestTimer from "@/components/ContestTimer";

export default function ContestProblemPageContent({
  problem,
  contest,
  contestId,
}: {
  problem: any;
  contest: any;
  contestId: number;
}) {
  return (
    <div className="flex h-full flex-col bg-gray-950 text-white">
      {/* Contest Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          {contest.title}
        </h1>

        <ContestTimer endTime={contest.endTime} />
      </div>

      {/* Problem + Code */}
      <div className="flex min-h-0 flex-1">
        {/* Problem Panel */}
        <section className="flex-1 overflow-auto border-r border-gray-800 bg-gray-950">
          <div className="p-6">
            <ProblemTabs
              data={problem}
              showSubmissions={false}
            />
          </div>
        </section>

        {/* Code Panel */}
        <section className="flex-1 min-w-0 bg-gray-900">
          <CodePanel
            problemId={problem.id}
            contestId={contestId}
          />
        </section>
      </div>
    </div>
  );
}