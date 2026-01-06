import { redirect } from "next/navigation";
import { getAuthData } from "@/lib/get-auth-data";
import ResetPasswordForm from "./components/ResetPasswordForm";

export default async function Profile({ params }: { params: { id: string } }) {
  const session = await getAuthData();

  const { id: paramsId } = await params;

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.id !== paramsId) {
    redirect("/");
  }

  const userName = session?.user.name;
  const userEmail = session?.user.email;
  const userId = session?.user.id;
  const userRole = session?.user.role || "-";
  const orgRole = session?.org?.role || "-";
  const createdAt = (session?.user.createdAt as Date) || 0;
  const updatedAt = (session?.user.updatedAt as Date) || 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <section className="border border-gray-100 p-4 rounded-xl">
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
          <h1 className="text-2xl mb-6">Profile</h1>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Name:</span> {userName}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">E-Mail:</span> {userEmail}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Globale Rolle:</span> {userRole}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Organisationsrolle:</span> {orgRole}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">ID:</span> {userId}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Erstellungsdatum:</span>{" "}
            {new Date(createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Aktualisierungsdatum:</span>{" "}
            {new Date(updatedAt).toLocaleString()}
          </p>
        </div>
      </section>
      <ResetPasswordForm />
    </div>
  );
}
