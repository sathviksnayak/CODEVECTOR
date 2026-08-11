import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import CreateContestPage from "./CreateContest";

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if ( user.role!=="SUPERADMIN" && user.role !== "ADMIN" ) {
    redirect("/");
  }

  return <CreateContestPage/>;
}