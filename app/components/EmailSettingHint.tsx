import { Info } from "lucide-react";
import Link from "next/link";

export default function EmailSettingHint({ id }: { id: string }) {
  return (
    <div className="w-full bg-blue-600 py-3 px-4 shadow-sm text-white">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Info className="w-4 h-4 flex-shrink-0" />
          <p>
            Der E-Mail-Versand ist derzeit deaktiviert. Sie können ihn in den{" "}
            <Link
              href={`/organization/${id}/admin?tab=settings#mail-config`}
              className="underline underline-offset-4 hover:text-blue-100 transition-colors"
            >
              Einstellungen aktivieren
            </Link>
            .
          </p>
        </div>
        <p className="text-[12px] text-blue-100 opacity-90 text-center leading-relaxed max-w-2xl">
          Rechnungen werden fest als <strong>Post-Versand</strong> konfiguriert.
          Diese Zuweisung erfolgt unwiderruflich zum Zeitpunkt der Erstellung,
          um die Konsistenz Ihrer Unterlagen zu gewährleisten.
        </p>
      </div>
    </div>
  );
}
