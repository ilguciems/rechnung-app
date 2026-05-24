"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useChannel } from "ably/react";
import { useSetAtom } from "jotai";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("notifications");
  const queryClient = useQueryClient();

  const setNotifications = useSetAtom(notificationsAtom);

  useChannel(`org-${orgId}`, (message) => {
    if (message.clientId === userId) return;

    if (message.name?.includes("invoice")) {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "invoices" ||
          query.queryKey[0] === "organization-logs",
      });
    }

    if (
      message.name?.includes("created") ||
      message.name?.includes("deleted") ||
      message.name?.includes("paid")
    ) {
      queryClient.invalidateQueries({ queryKey: ["organization-stats"] });
    }

    const reminderType =
      message.data.level === 1
        ? t("paymentReminder")
        : `${message.data.level - 1}. ${t("dunning")}`;
    const action = message.data.isSend ? t("sent") : t("downloaded");

    const notifications: Record<string, string> = {
      invoice_created: t("realtime.invoiceCreated", {
        userName: message.data.userName,
        number: message.data.number,
      }),
      invoice_deleted: t("realtime.invoiceDeleted", {
        userName: message.data.userName,
        number: message.data.number,
      }),
      invoice_paid: t("realtime.invoicePaid", {
        userName: message.data.userName,
        number: message.data.number,
        status: message.data.isPaid ? t("paid") : t("open"),
      }),
      invoice_reminder_downloaded: t("realtime.reminderAction", {
        userName: message.data.userName,
        type: reminderType,
        number: message.data.number,
        action,
      }),
      invoice_downloaded: t("realtime.invoiceAction", {
        userName: message.data.userName,
        number: message.data.number,
        action,
      }),
      invoice_email_sent: t("realtime.invoiceEmailSent", {
        userName: message.data.userName,
        number: message.data.number,
      }),
      invoice_reminder_email_sent: t("realtime.reminderEmailSent", {
        userName: message.data.userName,
        type: reminderType,
        number: message.data.number,
      }),
    };

    const newNotify: AppNotification = {
      id: message.id as string,
      title: notifications[message.name as string],
      description: message.data.userName,
      time: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [newNotify, ...prev].slice(0, 30));

    const toastText = notifications[message.name as string];

    if (toastText) {
      toast.success(toastText);
    }
  });

  return null;
};
