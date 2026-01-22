import {
  Building2,
  Handshake,
  Logs as LogsIcon,
  Settings,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getAuthData } from "@/lib/get-auth-data";
import { Tabs } from "../../../components";
import { Logs, MembershipList, NameForm, SendInviteForm } from "./components";

const tabs = [
  {
    id: "organization",
    label: "Organisation",
    icon: <Building2 />,
    content: (
      <>
        <NameForm /> <div>Organisation (in Verarbeitung)</div>
      </>
    ),
  },
  {
    id: "invitations",
    label: "Einladungen",
    icon: <Handshake />,
    content: (
      <>
        <SendInviteForm /> <div>Einladungen (in Verarbeitung)</div>
      </>
    ),
  },
  {
    id: "members",
    label: "Mitglieder",
    icon: <Users />,
    content: <MembershipList />,
  },
  {
    id: "settings",
    label: "Einstellungen",
    icon: <Settings />,
    content: <div>Einstellungen (in Verarbeitung)</div>,
  },
  { id: "logs", label: "Logs", icon: <LogsIcon />, content: <Logs /> },
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
