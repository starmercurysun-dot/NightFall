"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Moon } from "lucide-react";
import {
  getProfile,
  getSessionEmail,
  saveProfile,
  setSessionEmail,
} from "@/lib/storage";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getSessionEmail()) {
      router.replace("/tracker");
    }
  }, [router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      setError(t("login.errorEmail"));
      return;
    }
    setSessionEmail(normalized);
    const existing = getProfile();
    if (!existing) {
      saveProfile({
        email: normalized,
        username: normalized.split("@")[0] ?? "Night Owl",
        avatarUrl: "",
      });
    } else if (existing.email !== normalized) {
      saveProfile({ ...existing, email: normalized });
    }
    router.replace("/tracker");
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[#0a0a12] px-6 pb-12 pt-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.18),transparent)]" />

      <div className="relative flex justify-end">
        <LanguagePicker />
      </div>

      <div className="relative mt-4 flex flex-1 flex-col items-center text-center">
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-violet-500/40 to-blue-600/30 blur-2xl" />
          <div className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 shadow-[0_12px_48px_rgba(99,102,241,0.45)] ring-1 ring-white/20">
            <Moon className="h-10 w-10 text-white" strokeWidth={1.25} />
          </div>
        </div>

        <h1 className="mt-10 text-4xl font-bold tracking-tight text-white">
          {t("login.brand")}
        </h1>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-slate-400">
          {t("login.tagline")}
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-14 w-full max-w-sm space-y-5 text-left"
        >
          <div className="rounded-3xl border border-white/[0.08] bg-[#12101c]/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <label className="text-xs font-semibold text-slate-400">
              {t("login.email")}
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0d0b14] px-4 py-3.5">
              <Mail className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-slate-600"
                placeholder={t("login.placeholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-rose-300/90" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 py-4 text-base font-bold text-white shadow-[0_10px_40px_rgba(99,102,241,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            {t("login.getStarted")}
          </button>
        </form>
      </div>
    </div>
  );
}
