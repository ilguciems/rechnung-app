import { redirect } from "next/navigation";
import { getAuthData } from "@/lib/get-auth-data";
import { NameForm, SendInviteForm } from "./components";

export default async function Admin() {
  const session = await getAuthData();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.org?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <NameForm />
      <SendInviteForm />
    </div>
  );
}
