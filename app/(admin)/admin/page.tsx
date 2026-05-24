import { ShieldPlus, UserCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { GLOBAL_ADMIN_ROLES, type GlobalRole } from "@/types/global-roles";
import { Tabs } from "../../components";
import CreateAdminForm from "./components/CreateAdminForm";
import UsersList from "./components/UsersList";

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin =
    session?.user?.role &&
    GLOBAL_ADMIN_ROLES.includes(session.user.role as GlobalRole);

  if (!isAdmin) {
    redirect("/");
  }

  const tabs = [
    {
      id: "users",
      label: t("users"),
      icon: <UserCheck />,
      content: <UsersList />,
    },
    {
      id: "create-admin",
      label: t("createAdmin"),
      icon: <ShieldPlus />,
      content: <CreateAdminForm />,
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <Tabs tabs={tabs} />
    </div>
  );
}
