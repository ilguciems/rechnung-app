"use client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { type ActivityLogType, useLogs } from "@/hooks";

function getUserLabel(log: ActivityLogType) {
  return log.user.name ?? log.user.email;
}

function renderLogMessage(
  log: ActivityLogType,
  t: ReturnType<typeof useTranslations<"logs">>,
) {
  const invoiceNumber = log.metadata.invoiceNumber ?? "";
  const level = log.metadata.level ?? 0;
  const reminderType = level === 1 ? t("paymentReminder") : t("dunning");

  switch (log.entityType) {
    case "INVOICE":
      if (log.action === "CREATE")
        return t("invoiceCreated", { number: invoiceNumber });
      if (log.action === "DELETE")
        return t("invoiceDeleted", { number: invoiceNumber });
      if (log.action === "DOWNLOAD") {
        if (log.metadata.type === "payment-reminder")
          return t("reminderDownloadedPdf", {
            type: reminderType,
            level,
            number: invoiceNumber,
          });
        return t("invoiceDownloadedPdf", { number: invoiceNumber });
      }
      if (log.action === "UPDATE")
        return t("invoiceUpdated", { number: invoiceNumber });
      break;

    case "COMPANY":
      if (log.action === "UPDATE") return t("companyUpdated");
      if (log.action === "CREATE") return t("companyCreated");
      break;

    case "EMAIL":
      if (log.action === "SEND") {
        if (log.metadata.type === "payment-reminder")
          return t("reminderSentEmail", {
            type: reminderType,
            level,
            number: invoiceNumber,
          });
        return t("invoiceSentEmail", { number: invoiceNumber });
      }
      break;
  }

  return t("unknownAction");
}

export default function Logs() {
  const t = useTranslations("logs");
  const { data: logs, isLoading } = useLogs();

  const fieldLabels = useMemo(
    () => ({
      name: t("fields.name"),
      street: t("fields.street"),
      houseNumber: t("fields.houseNumber"),
      zipCode: t("fields.zipCode"),
      city: t("fields.city"),
      country: t("fields.country"),
      phone: t("fields.phone"),
      email: t("fields.email"),
      iban: t("fields.iban"),
      bic: t("fields.bic"),
      bank: t("fields.bank"),
      logoUrl: t("fields.logoUrl"),
      isSubjectToVAT: t("fields.isSubjectToVAT"),
      firstTaxRate: t("fields.firstTaxRate"),
      secondTaxRate: t("fields.secondTaxRate"),
      legalForm: t("fields.legalForm"),
      steuernummer: t("fields.steuernummer"),
      ustId: t("fields.ustId"),
      handelsregisternummer: t("fields.handelsregisternummer"),
      isPaid: t("fields.isPaid"),
      paidAt: t("fields.paidAt"),
    }),
    [t],
  );

  const valueLabels = useMemo(
    () => ({
      yes: t("values.yes"),
      no: t("values.no"),
      paid: t("values.paid"),
      open: t("values.open"),
      null: t("values.null"),
    }),
    [t],
  );

  if (isLoading) return <div>{t("loading")}</div>;

  if (!logs?.length) {
    return <div className="text-gray-500">{t("empty")}</div>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex flex-col gap-1 rounded border p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-800 dark:text-gray-200">
              <strong>{getUserLabel(log)}</strong> {renderLogMessage(log, t)}
            </span>

            <span className="text-xs text-gray-400 dark:text-gray-200">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>

          {log.action === "UPDATE" && log.metadata?.changes && (
            <ul className="mt-2 text-xs text-gray-600 dark:text-gray-200">
              {Object.entries(log.metadata.changes).map(
                ([field, { old, new: newVal }]) => (
                  <li key={field}>
                    <strong>
                      {fieldLabels[field as keyof typeof fieldLabels] ?? field}
                    </strong>
                    : "{valueLabels[old as keyof typeof valueLabels] ?? old}" →
                    "{valueLabels[newVal as keyof typeof valueLabels] ?? newVal}
                    "
                  </li>
                ),
              )}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
