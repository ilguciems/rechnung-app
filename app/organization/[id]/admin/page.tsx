import { Handshake, Logs as LogsIcon, Settings, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Tabs } from "@/app/components";
import { getAuthData } from "@/lib/get-auth-data";
import {
  Logs,
  MailJetConfigForm,
  MembershipList,
  NameForm,
  PendingInvitationsList,
  SendInviteForm,
} from "./components";

const tabs = [
  {
    id: "members",
    label: "Mitglieder",
    icon: <Users />,
    content: <MembershipList />,
  },
  {
    id: "invitations",
    label: "Einladungen",
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
    label: "Einstellungen",
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
    label: "Logs",
    icon: <LogsIcon />,
    content: <Logs />,
  },
];

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
      <Tabs tabs={tabs} />
    </div>
  );
}
