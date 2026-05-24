import { Info } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function EmailSettingHint({ id }: { id: string }) {
  const t = useTranslations("emailSetting");

  return (
    <div className="w-full bg-blue-600 py-3 px-4 shadow-sm text-white">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Info className="w-4 h-4 shrink-0" />
          <p>
            {t.rich("disabled", {
              link: (chunks) => (
                <Link
                  href={`/organization/${id}/admin?tab=settings#mail-config`}
                  className="underline underline-offset-4 hover:text-blue-100 transition-colors"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
        <p className="text-[12px] text-blue-100 opacity-90 text-center leading-relaxed max-w-2xl">
          {t.rich("postOnly", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
      </div>
    </div>
  );
}
