"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  Mail,
  Moon,
  Upload,
  User,
} from "lucide-react";
import {
  clearSession,
  getProfile,
  getSessionEmail,
  saveProfile,
  setSessionEmail,
} from "@/lib/storage";
import type { UserProfile } from "@/lib/types/record";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    const email = getSessionEmail();
    if (!email) return;
    const existing = getProfile();
    if (existing) {
      setDraft(existing);
    } else {
      setDraft({
        email,
        username: email.split("@")[0] ?? "Night Owl",
        avatarUrl: "",
      });
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const p = getProfile();
      if (p) setDraft(p);
    };
    window.addEventListener("nightly-profile-changed", handler);
    return () => window.removeEventListener("nightly-profile-changed", handler);
  }, []);

  if (!draft) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-pulse rounded-full bg-violet-500/20" />
      </div>
    );
  }

  const onAvatarFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      setDraft((d) => (d ? { ...d, avatarUrl: url } : d));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const normalized = draft.email.trim().toLowerCase();
    const next = { ...draft, email: normalized };
    saveProfile(next);
    setSessionEmail(normalized);
    setDraft(next);
    setSavedHint(true);
    window.setTimeout(() => setSavedHint(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href="/tracker"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.12)] transition hover:bg-violet-500/20"
            aria-label={t("common.back")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t("profile.title")}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{t("profile.subtitle")}</p>
          </div>
        </div>
        <LanguagePicker />
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-violet-500/35 to-blue-600/25 blur-2xl" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 shadow-[0_12px_40px_rgba(99,102,241,0.35)] ring-2 ring-white/15">
            {draft.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.avatarUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-14 w-14 text-white/95" strokeWidth={1.25} />
            )}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
          <Moon className="h-4 w-4 text-violet-300/80" />
          <span>{t("profile.member")}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/[0.08] bg-[#14121f]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <User className="h-4 w-4 text-violet-400" />
            {t("profile.username")}
          </div>
          <input
            className="mt-3 w-full rounded-2xl border border-white/[0.06] bg-[#0d0b14] px-4 py-3.5 text-[15px] text-white outline-none focus:border-violet-400/30"
            value={draft.username}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, username: e.target.value } : d))
            }
          />
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#14121f]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Mail className="h-4 w-4 text-violet-400" />
            {t("profile.email")}
          </div>
          <input
            type="email"
            className="mt-3 w-full rounded-2xl border border-white/[0.06] bg-[#0d0b14] px-4 py-3.5 text-[15px] text-white outline-none focus:border-violet-400/30"
            value={draft.email}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, email: e.target.value } : d))
            }
          />
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-400/25 bg-violet-500/5 py-3 text-xs font-medium text-violet-200/80 transition hover:border-violet-400/40 hover:bg-violet-500/10">
          <Upload className="h-4 w-4" />
          {t("profile.uploadAvatar")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAvatarFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {savedHint && (
        <p className="text-center text-sm text-emerald-300/90">
          {t("common.saved")}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 py-4 text-base font-bold text-white shadow-[0_10px_36px_rgba(99,102,241,0.38)] transition hover:brightness-110 active:scale-[0.99]"
      >
        {t("profile.saveChanges")}
      </button>

      <button
        type="button"
        onClick={() => {
          clearSession();
          router.replace("/login");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-rose-500/50 bg-transparent py-4 text-base font-bold text-rose-400 transition hover:bg-rose-500/10"
      >
        <LogOut className="h-5 w-5" />
        {t("profile.logout")}
      </button>

      <div className="pt-6 text-center">
        <p className="text-xs text-slate-500">{t("profile.appVersion")}</p>
        <p className="mt-1 text-sm font-bold text-white">
          {t("profile.versionName")}
        </p>
      </div>
    </div>
  );
}
