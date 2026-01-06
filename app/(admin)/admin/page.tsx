import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UsersList from "./components/UsersList";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <UsersList />
    </div>
  );
}
