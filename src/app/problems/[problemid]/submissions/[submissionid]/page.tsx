import { prisma } from "@/lib/prisma";  


export default async  function Page({ params }: { params: Promise<{ problemid: string, submissionid: string }> }) {
        const { problemid, submissionid } = (await params);
        const data= await prisma.submission.findUnique({
  where: {
    id: Number(submissionid),
  },
});

    return (

        <div>
        <h1 className="text-2xl font-bold mb-4">Submission Details</h1>
        <p><strong>Problem ID:</strong> {problemid}</p>
        <p><strong>Verdict:</strong> {data?.verdict}</p>
        <pre className="overflow-x-auto rounded border p-4">
  <code>{data?.code}</code>
</pre>
        </div>



    )












}