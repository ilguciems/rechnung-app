"use client";
import { type ActivityLogType, useLogs } from "@/hooks";

function getUserLabel(log: ActivityLogType) {
  return log.user.name ?? log.user.email;
}

const translateKeys = {
  name: "Firmenname",
  street: "Straße",
  houseNumber: "Hausnummer",
  zipCode: "PLZ",
  city: "Ort",
  country: "Land",

  phone: "Telefonnummer",
  email: "E-Mail",
  iban: "IBAN",
  bic: "BIC",
  bank: "Bank",
  logoUrl: "Logo URL",

  isSubjectToVAT: "Steuerpflichtig",
  firstTaxRate: "Steuersatz 1",
  secondTaxRate: "Steuersatz 2",

  legalForm: "Gesellschaftsform",

  steuernummer: "Steuernummer",
  ustId: "USt-IdNr.",
  handelsregisternummer: "Handelsregisternummer",

  isPaid: "Bezahlstatus",
  paidAt: "Bezahlt am",
};

const translateValues = {
  yes: "Ja",
  no: "Nein",

  paid: "Bezahlt",
  open: "Offen",

  null: "-",
};

function renderLogMessage(log: ActivityLogType) {
  switch (log.entityType) {
    case "INVOICE":
      if (log.action === "CREATE") {
        return `Rechnung ${log.metadata.invoiceNumber} erstellt`;
      }

      if (log.action === "DELETE") {
        return `Rechnung ${log.metadata.invoiceNumber} gelöscht`;
      }

      if (log.action === "DOWNLOAD") {
        if (log.metadata.type === "payment-reminder") {
          return `${log.metadata.level === 1 ? "Zahlungserinnerung" : "Mahnung"} (Stufe ${log.metadata.level}) für Rechnung ${log.metadata.invoiceNumber} als PDF heruntergeladen`;
        }
        return `Rechnung ${log.metadata.invoiceNumber} als PDF heruntergeladen`;
      }

      if (log.action === "UPDATE") {
        return `Rechnung ${log.metadata.invoiceNumber} aktualisiert`;
      }

      break;

    case "COMPANY":
      if (log.action === "UPDATE") {
        return "Firmendaten aktualisiert";
      }
      if (log.action === "CREATE") {
        return "Firma erstellt";
      }
      break;

    case "EMAIL":
      if (log.action === "SEND") {
        if (log.metadata.type === "payment-reminder") {
          return `${log.metadata.level === 1 ? "Zahlungserinnerung" : "Mahnung"} (Stufe ${log.metadata.level}) für Rechnung ${log.metadata.invoiceNumber} per E-Mail versendet`;
        }
        return `Rechnung ${log.metadata.invoiceNumber} per E-Mail versendet`;
      }
      break;
  }

  return "Unbekannte Aktion";
}

export default function Logs() {
  const { data: logs, isLoading } = useLogs();

  if (isLoading) return <div>Loading...</div>;

  if (!logs?.length) {
    return <div className="text-gray-500">Keine Aktivitäten vorhanden</div>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex flex-col gap-1 rounded border p-3 bg-white"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-800">
              <strong>{getUserLabel(log)}</strong> {renderLogMessage(log)}
            </span>

            <span className="text-xs text-gray-400">
              {new Date(log.createdAt).toLocaleString("de-DE")}
            </span>
          </div>

          {log.action === "UPDATE" && log.metadata?.changes && (
            <ul className="mt-2 text-xs text-gray-600">
              {Object.entries(log.metadata.changes).map(
                ([field, { old, new: newVal }]) => (
                  <li key={field}>
                    <strong>
                      {translateKeys[field as keyof typeof translateKeys] ??
                        field}
                    </strong>
                    : "
                    {translateValues[old as keyof typeof translateValues] ??
                      old}
                    " → "
                    {translateValues[newVal as keyof typeof translateValues] ??
                      newVal}
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
