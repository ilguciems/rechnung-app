"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useChannel } from "ably/react";
import { useSetAtom } from "jotai";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks";
import { type AppNotification, notificationsAtom } from "@/store/notifications";

export default function RealtimeNotifications() {
  const { orgId, session } = useAuth();

  if (!orgId || !session) return null;

  return <NotificationHandler orgId={orgId} userId={session.user.id} />;
}

export const NotificationHandler = ({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}) => {
  const queryClient = useQueryClient();

  const setNotifications = useSetAtom(notificationsAtom);

  useChannel(`org-${orgId}`, (message) => {
    if (message.clientId === userId) return;

    if (message.name?.includes("invoice")) {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }

    const notifications: Record<string, string> = {
      invoice_created: `${message.data.userName} hat eine neue Rechnungs 
         ${message.data.number} erstellt.`,
      invoice_deleted: `${message.data.userName} hat die Rechnungs 
         ${message.data.number} gelöscht`,
      invoice_paid: `${message.data.userName} hat die Rechnungs 
         ${message.data.number} als ${message.data.isPaid ? "bezahlt" : "offen"} gesetzt`,
      invoice_reminder_downloaded: `${message.data.userName} hat die 
         ${message.data.level === 1 ? "Zahlungserinnerung" : `${message.data.level - 1}.Mahnung`} für Rechnung 
         ${message.data.number} ${message.data.isSend ? "gesendet" : "heruntergeladen"}`,
      invoice_downloaded: `${message.data.userName} hat die Rechnung 
         ${message.data.number} ${message.data.isSend ? "gesendet" : "heruntergeladen"}`,
      invoice_email_sent: `${message.data.userName} hat die Rechnung 
         ${message.data.number} per E-Mail gesendet`,
      invoice_reminder_email_sent: `${message.data.userName} hat die 
         ${message.data.level === 1 ? "Zahlungserinnerung" : `${message.data.level - 1}.Mahnung`} für Rechnung 
         ${message.data.number} per E-Mail gesendet`,
    };

    const newNotify: AppNotification = {
      id: message.id as string,
      title: notifications[message.name as string],
      description: message.data.userName,
      time: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [newNotify, ...prev].slice(0, 30)); // храним последние 30

    const toastText = notifications[message.name as string];

    if (toastText) {
      toast.success(toastText);
    }
  });

  return null;
};
