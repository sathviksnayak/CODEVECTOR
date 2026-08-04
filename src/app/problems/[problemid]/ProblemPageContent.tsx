
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
    <div className="flex h-screen">
      <section className="flex-1 border-r">
        <ProblemTabs data={problem} submissions={submissions} />
      </section>

      <section className="flex-1">
        <CodePanel problemId={problem.id} />
      </section>
    </div>
  );
}