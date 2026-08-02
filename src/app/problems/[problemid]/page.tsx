
import ProblemPageContent from "./ProblemPageContent";

export default async function Page({ params }: { params: Promise<{ problemid: string }> }) {
        const problemid = (await params).problemid;

        const problem= await fetch(`http://localhost:3000/api/problems/${problemid}`)
        const data = await problem.json();
        


  return (
    <ProblemPageContent problem={data} />
  );


}