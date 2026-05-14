"use client";

import { Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/messages";
import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  className?: string;
  buttonClassName?: string;
};

export function LanguagePicker({ className, buttonClassName }: Props) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const pick = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div className={className ?? "relative"} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          buttonClassName ??
          "flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/35 bg-violet-500/10 text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/15"
        }
        aria-label={t("dashboard.langAria")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="h-5 w-5" />
      </button>
      {open && (
        <ul
          className="absolute right-0 z-50 mt-2 min-w-[9.5rem] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#14121f]/95 py-1 shadow-xl backdrop-blur-md"
          role="listbox"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={locale === "en"}
              onClick={() => pick("en")}
              className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${
                locale === "en"
                  ? "font-semibold text-violet-200"
                  : "text-slate-300"
              }`}
            >
              {t("lang.en")}
            </button>
          </li>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={locale === "zh"}
              onClick={() => pick("zh")}
              className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${
                locale === "zh"
                  ? "font-semibold text-violet-200"
                  : "text-slate-300"
              }`}
            >
              {t("lang.zh")}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
