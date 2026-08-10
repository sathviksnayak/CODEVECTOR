import CodePanel from "./_components/CodePanel/CodePanel";
import ProblemTabs from "./_components/ProblemPanel/Tabs";

export default function ProblemPageContent({
  problem,
  submissions,
}: {
  problem: any;
  submissions: any[];
}) {
  return (
    <main className="h-[calc(100vh-73px)] overflow-hidden bg-black">
      <div className="flex h-full min-h-0 flex-col lg:flex-row">

        {/* Problem panel */}
        <section className="min-h-0 w-full overflow-hidden border-b border-gray-800 lg:w-[48%] lg:border-b-0 lg:border-r">
          <div className="h-full overflow-y-auto">
            <ProblemTabs
              data={problem}
              submissions={submissions}
            />
          </div>
        </section>

        {/* Code editor */}
        <section className="min-h-0 w-full flex-1 lg:w-[52%]">
          <div className="h-full">
            <CodePanel problemId={problem.id} />
          </div>
        </section>

      </div>
    </main>
  );
}