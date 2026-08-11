import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import CreateProblemPage from "./CreateProblem";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <CreateProblemPage/>;
}