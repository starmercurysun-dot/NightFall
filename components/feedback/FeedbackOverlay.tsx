"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { ArrowRight, Bomb, Trophy } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";

type Mode = "success" | "fail";

type Props = {
  mode: Mode | null;
  /** Shown on success screen */
  streakDays?: number;
  onDone: () => void;
};

const CONFETTI = 36;

export function FeedbackOverlay({ mode, streakDays = 0, onDone }: Props) {
  const { t, locale } = useI18n();

  const streakText =
    locale === "zh"
      ? t("feedback.streakZh", { n: streakDays })
      : streakDays === 1
        ? t("feedback.streakEnOne")
        : t("feedback.streakEnMany", { n: streakDays });

  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 3 + Math.random() * 5,
        rot: Math.random() * 360,
        delay: Math.random() * 0.5,
      })),
    [mode],
  );

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={
            mode === "success"
              ? t("feedback.successAria")
              : t("feedback.failAria")
          }
        >
          {mode === "success" && (
            <>
              <div
                className="absolute inset-0 bg-[#0a0812]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(139,92,246,0.35)_0%,transparent_55%)]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {pieces.map((p) => (
                  <span
                    key={p.id}
                    className="animate-confetti-drift absolute rounded-sm bg-violet-200/35 shadow-sm"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: p.s,
                      height: p.s * 1.2,
                      transform: `rotate(${p.rot}deg)`,
                      animationDelay: `${p.delay}s`,
                    }}
                  />
                ))}
              </div>

              <motion.div
                className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 scale-150 rounded-full bg-violet-500/25 blur-2xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_40px_rgba(139,92,246,0.45)] ring-2 ring-white/10">
                    <Trophy className="h-9 w-9 text-white/95" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="mt-8 text-3xl font-bold tracking-tight text-white">
                  {t("feedback.successTitle")}
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-violet-200/85">
                  {t("feedback.successBody")}
                </p>

                <div className="mt-8 w-full rounded-3xl border border-white/[0.08] bg-white/[0.05] px-6 py-5 text-left backdrop-blur-md">
                  <p className="text-xs text-slate-400">
                    {t("feedback.streakLabel")}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-transparent bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text">
                    {streakText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onDone}
                  className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)] transition hover:brightness-110 active:scale-[0.99]"
                >
                  {t("feedback.backDashboard")}
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </motion.div>
            </>
          )}

          {mode === "fail" && (
            <>
              <div className="absolute inset-0 bg-[#0c0808]" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(220,80,90,0.28)_0%,transparent_55%)]"
                aria-hidden
              />

              <motion.div
                className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 scale-[1.8] rounded-full bg-red-500/30 blur-3xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-[0_0_36px_rgba(239,68,68,0.55)] ring-2 ring-white/15">
                    <Bomb className="h-9 w-9 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h2 className="mt-8 text-3xl font-bold tracking-tight text-white">
                  {t("feedback.failTitle")}
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-rose-200/85">
                  {t("feedback.failBody")}
                </p>

                <div className="mt-8 w-full rounded-3xl border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-left backdrop-blur-md">
                  <p className="text-xs font-medium text-slate-500">
                    {t("feedback.keepTryingTitle")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {t("feedback.keepTryingBody")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onDone}
                  className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-red-500 py-4 text-base font-bold text-white shadow-[0_12px_36px_rgba(239,68,68,0.4)] transition hover:bg-red-600 active:scale-[0.99]"
                >
                  {t("feedback.tryTomorrow")}
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
