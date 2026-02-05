import {
  Bell,
  Clock,
  FileText,
  Mail,
  Square,
  SquareCheckBig,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { InvoiceItem } from "@/lib/zod-schema";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  createdAt: string;
  items: InvoiceItem[];
  isPaid: boolean;
  customerNumber: string;
  overduePaymentLevel: number | null;
  customerEmail: string;
  lastSentAt: string | null;
  invoiceSentAt: string | null;
  lastReminderLevel: 0 | 1 | 2 | 3;
  firstReminderSentAt: string | null;
  secondReminderSentAt: string | null;
  thirdReminderSentAt: string | null;
  deliveryMethod: "EMAIL" | "POST";
};

type MahnungTitles = {
  [key: number]: { title: string; color: string };
};

export const MAHNUNG_OPTIONS: MahnungTitles = {
  1: { title: "Zahlungserinnerung als PDF", color: "text-blue-500" },
  2: { title: "1. Mahnung als PDF", color: "text-orange-500" },
  3: { title: "2. Mahnung als PDF", color: "text-red-500" },
};

function getAvailableMahnungLevel(invoice: Invoice) {
  if (invoice.isPaid) return null;

  if (!invoice.invoiceSentAt) return "send_invoice";

  const now = new Date();

  const lastActionDate =
    invoice.thirdReminderSentAt ||
    invoice.secondReminderSentAt ||
    invoice.firstReminderSentAt ||
    invoice.invoiceSentAt;

  const diffDays = Math.floor(
    (now.getTime() - new Date(lastActionDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const currentLevel = invoice.lastReminderLevel || 0;
  if (currentLevel >= 3) return "inkasso_ready";

  const daysToWait = currentLevel === 0 ? 30 : 14;

  if (diffDays >= daysToWait) {
    return currentLevel + 1;
  }

  return { status: "waiting" as const, daysLeft: daysToWait - diffDays };
}

export function getInvoiceActions({
  inv,
  downloadInvoice,
  downloadReminder,
  setEmailModalConfig,
  togglePaid,
  canSendEmail,
}: {
  inv: Invoice;
  downloadInvoice: (id: string) => void;
  downloadReminder: (id: string, level: number) => void;
  setEmailModalConfig: (config: {
    invoice: Invoice;
    type: "invoice" | "reminder";
    level?: number;
  }) => void;
  togglePaid: { mutate: (data: { id: string; current: boolean }) => void };
  canSendEmail: boolean;
}) {
  const actions = [];

  actions.push({
    id: `${inv.id}-toggle`,
    text: inv.isPaid ? "Offen setzen" : "Bezahlt setzen",
    node: (
      <span className="flex items-center">
        {inv.isPaid ? (
          <Square className="w-4 h-4 mr-2" />
        ) : (
          <SquareCheckBig className="w-4 h-4 mr-2" />
        )}
        <span>{inv.isPaid ? "Offen setzen" : "Bezahlt setzen"}</span>
      </span>
    ),
    onClick: () => togglePaid.mutate({ id: inv.id, current: inv.isPaid }),
  });

  actions.push({
    id: `${inv.id}-download`,
    text: "Rechnung als PDF",
    node: (
      <span className="flex items-center">
        <FileText className="w-4 h-4 mr-2" />
        <span>Rechnung als PDF</span>
        {canSendEmail && (
          <span
            className={`ml-2 w-3 h-3 rounded-full ${inv.invoiceSentAt ? "bg-green-500" : "bg-orange-400 animate-pulse"}`}
            title={inv.invoiceSentAt ? "Versendet" : "Entwurf"}
          />
        )}
      </span>
    ),
    onClick: () => downloadInvoice(inv.id),
  });

  if (canSendEmail && !inv.invoiceSentAt) {
    actions.push({
      id: `${inv.id}-email`,
      text: "Rechnung per Email",
      node: (
        <span className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          <span>Rechnung per Email</span>
        </span>
      ),
      onClick: () => setEmailModalConfig({ invoice: inv, type: "invoice" }),
    });
  }

  if (inv.overduePaymentLevel) {
    for (let l = 1; l <= inv.overduePaymentLevel; l++) {
      const isSent =
        (l === 1 && inv.firstReminderSentAt) ||
        (l === 2 && inv.secondReminderSentAt) ||
        (l === 3 && inv.thirdReminderSentAt);

      actions.push({
        id: `${inv.id}-dl-reminder-${l}`,
        text: MAHNUNG_OPTIONS[l].title,
        node: (
          <span className="flex items-center">
            <Bell className={`w-4 h-4 mr-2 ${MAHNUNG_OPTIONS[l].color}`} />
            <span>{MAHNUNG_OPTIONS[l].title}</span>
            {canSendEmail && (
              <span
                className={`ml-2 w-3 h-3 rounded-full ${isSent ? "bg-green-500" : "bg-orange-400 animate-pulse"}`}
                title={isSent ? "Versendet" : "Entwurf"}
              />
            )}
          </span>
        ),
        onClick: () => downloadReminder(inv.id, l),
      });
    }
  }

  if (canSendEmail) {
    const nextAction = getAvailableMahnungLevel(inv);

    if (typeof nextAction === "number") {
      actions.push({
        id: `${inv.id}-send-reminder-${nextAction}`,
        text: `${nextAction === 1 ? "Zahlungserinnerung" : nextAction - 1 + ".Mahnung"} senden`,
        node: (
          <span className="flex items-center text-black font-bold">
            <Bell className="w-4 h-4 mr-2 text-orange-500" />
            <span>{`${nextAction === 1 ? "Zahlungserinnerung" : nextAction - 1 + ".Mahnung"} senden`}</span>
          </span>
        ),
        onClick: () =>
          setEmailModalConfig({
            invoice: inv,
            type: "reminder",
            level: nextAction,
          }),
      });
    } else if (
      nextAction &&
      typeof nextAction === "object" &&
      nextAction.status === "waiting"
    ) {
      const daysLeft = nextAction.daysLeft;

      actions.push({
        id: `${inv.id}-waiting`,
        text: `Warten (${daysLeft} Tage)`,
        node: (
          <span className="flex items-center text-slate-400 cursor-not-allowed">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-xs">
              Frist für{" "}
              {inv.lastReminderLevel === 0
                ? "Zahlungserinnerung"
                : inv.lastReminderLevel + ".Mahnung"}{" "}
              noch {daysLeft === 1 ? "1 Tag" : `${daysLeft} Tage`}
            </span>
          </span>
        ),
        onClick: () => toast.error(`Die Frist läuft noch ${daysLeft} Tage.`),
      });
    }
  }

  return actions;
}
