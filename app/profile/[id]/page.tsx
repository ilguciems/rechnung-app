import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAuthData } from "@/lib/get-auth-data";
import ResetPasswordForm from "./components/ResetPasswordForm";


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

export default async function Profile({ params }: { params: { id: string } }) {
  const t = await getTranslations("profile");
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
      <section className="border border-gray-100 p-4 rounded-xl dark:bg-black">
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
          <h1 className="text-2xl mb-6">{t("title")}</h1>
          <ItemWrapper item={t("name")}>{userName}</ItemWrapper>
          <ItemWrapper item={t("email")}>{userEmail}</ItemWrapper>
          <ItemWrapper item={t("globalRole")}>{userRole}</ItemWrapper>
          <ItemWrapper item={t("orgRole")}>{orgRole}</ItemWrapper>
          <ItemWrapper item={t("id")}>{userId}</ItemWrapper>
          <ItemWrapper item={t("createdAt")}>
            {new Date(createdAt).toLocaleString()}
          </ItemWrapper>
          <ItemWrapper item={t("updatedAt")}>
            {new Date(updatedAt).toLocaleString()}
          </ItemWrapper>
        </div>
      </section>
      <ResetPasswordForm />
    </div>
  );
}
