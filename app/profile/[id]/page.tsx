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

  const ItemWrapper = ({
    children,
    item,
  }: {
    children: React.ReactNode;
    item: string;
  }) => (
    <p className="text-sm text-gray-800 dark:text-gray-200">
      <span className="font-semibold">{item}:</span> {children}
    </p>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <section className="border border-gray-100 p-4 rounded-xl dark:bg-black">
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
          <h1 className="text-2xl mb-6">Profile</h1>
          <ItemWrapper item="Name">{userName}</ItemWrapper>
          <ItemWrapper item="E-Mail">{userEmail}</ItemWrapper>
          <ItemWrapper item="Globale Rolle">{userRole}</ItemWrapper>
          <ItemWrapper item="Organisationsrolle">{orgRole}</ItemWrapper>
          <ItemWrapper item="ID">{userId}</ItemWrapper>
          <ItemWrapper item="Erstellungsdatum">
            {new Date(createdAt).toLocaleString()}
          </ItemWrapper>
          <ItemWrapper item="Aktualisierungsdatum">
            {new Date(updatedAt).toLocaleString()}
          </ItemWrapper>
        </div>
      </section>
      <ResetPasswordForm />
    </div>
  );
}
