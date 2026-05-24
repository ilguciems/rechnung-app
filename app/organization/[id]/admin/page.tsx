import {
  Activity,
  Handshake,
  Logs as LogsIcon,
  Settings,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Tabs } from "@/app/components";
import { getAuthData } from "@/lib/get-auth-data";
import {
  Logs,
  MailJetConfigForm,
  MembershipList,
  NameForm,
  PendingInvitationsList,
  SendInviteForm,
  Statistics,
} from "./components";

export default async function Admin() {
  const t = await getTranslations("organization.tabs");
  const session = await getAuthData();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.org?.role !== "admin") {
    redirect("/");
  }

  const tabs = [
    {
      id: "statistics",
      label: t("statistics"),
      icon: <Activity />,
      content: <Statistics />,
    },
    {
      id: "members",
      label: t("members"),
      icon: <Users />,
      content: <MembershipList />,
    },
    {
      id: "invitations",
      label: t("invitations"),
      icon: <Handshake />,
      content: (
        <>
          <SendInviteForm />
          <PendingInvitationsList />
        </>
      ),
    },
    {
      id: "settings",
      label: t("settings"),
      icon: <Settings />,
      content: (
        <>
          <NameForm />
          <MailJetConfigForm />
        </>
      ),
    },
    {
      id: "logs",
      label: t("logs"),
      icon: <LogsIcon />,
      content: <Logs />,
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <Tabs tabs={tabs} />
    </div>
  );
}
