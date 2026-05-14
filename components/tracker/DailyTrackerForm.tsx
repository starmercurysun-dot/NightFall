"use client";

import Link from "next/link";
import {
  BarChart3,
  Bed,
  CalendarDays,
  Home,
  Settings,
  Smartphone,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyRecord } from "@/lib/types/record";
import {
  computeRecordOutcome,
  minutesToInputValue,
  parseTimeToMinutes,
} from "@/lib/time";
import {
  getCurrentGoals,
  getRecordByDate,
  listRecords,
  saveCurrentGoals,
  upsertRecord,
} from "@/lib/storage";
import { computeSuccessStreak } from "@/lib/stats";
import { newId } from "@/lib/id";
import { FeedbackOverlay } from "@/components/feedback/FeedbackOverlay";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";
import { useI18n } from "@/components/i18n/LocaleProvider";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Step = "home" | "bed" | "phone";

export function DailyTrackerForm() {
  const { t } = useI18n();
  const [date, setDate] = useState(todayISO);
  const [, bump] = useState(0);
  const [feedback, setFeedback] = useState<"success" | "fail" | null>(null);
  const [streakForOverlay, setStreakForOverlay] = useState(0);

  const [targetsOpen, setTargetsOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [logStep, setLogStep] = useState<Step | null>(null);
  const [draftTime, setDraftTime] = useState("");

  const [draftBedGoal, setDraftBedGoal] = useState("23:00");
  const [draftPhoneGoal, setDraftPhoneGoal] = useState("23:15");

  const existing = getRecordByDate(date);
  const isToday = date === todayISO();

  const displayGoals = existing
    ? {
        bed: existing.goalSnapshot.bedtimeGoalMinutes,
        phone: existing.goalSnapshot.phoneDownGoalMinutes,
      }
    : (() => {
        const g = getCurrentGoals();
        return { bed: g.bedtimeGoalMinutes, phone: g.phoneDownGoalMinutes };
      })();

  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const onRecords = () => refresh();
    window.addEventListener("nightly-records-changed", onRecords);
    return () => window.removeEventListener("nightly-records-changed", onRecords);
  }, [refresh]);

  const homeM = existing?.homeArrivalMinutes ?? null;
  const bedM = existing?.actualBedtimeMinutes ?? null;
  const phoneM = existing?.actualPhoneDownMinutes ?? null;

  const activeStep: Step | null = useMemo(() => {
    if (homeM === null) return "home";
    if (bedM === null) return "bed";
    if (phoneM === null) return "phone";
    return null;
  }, [homeM, bedM, phoneM]);

  const openLog = (step: Step) => {
    const locked =
      (step === "bed" && homeM === null) ||
      (step === "phone" && (homeM === null || bedM === null));
    if (locked) return;
    const current =
      step === "home"
        ? homeM
        : step === "bed"
          ? bedM
          : phoneM;
    setDraftTime(current !== null ? minutesToInputValue(current) : "");
    setLogStep(step);
  };

  const persistRecord = (patch: {
    homeArrivalMinutes: number | null;
    actualBedtimeMinutes: number | null;
    actualPhoneDownMinutes: number | null;
    goalSnapshot: DailyRecord["goalSnapshot"];
  }) => {
    const now = new Date().toISOString();
    const prev = getRecordByDate(date);
    const outcome = computeRecordOutcome({
      actualBedtimeMinutes: patch.actualBedtimeMinutes,
      actualPhoneDownMinutes: patch.actualPhoneDownMinutes,
      goal: patch.goalSnapshot,
    });
    const rec: DailyRecord = {
      id: prev?.id ?? newId(),
      date,
      homeArrivalMinutes: patch.homeArrivalMinutes,
      actualBedtimeMinutes: patch.actualBedtimeMinutes,
      actualPhoneDownMinutes: patch.actualPhoneDownMinutes,
      goalSnapshot: patch.goalSnapshot,
      status: outcome.status === "incomplete" ? "incomplete" : outcome.status,
      timeGapMinutes: outcome.timeGapMinutes,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };
    upsertRecord(rec);
    refresh();
    if (outcome.status === "success" || outcome.status === "fail") {
      if (outcome.status === "success") {
        setStreakForOverlay(computeSuccessStreak(listRecords()));
      }
      setFeedback(outcome.status);
    }
  };

  const saveLogTime = () => {
    if (!logStep) return;
    const m = draftTime ? parseTimeToMinutes(draftTime) : null;
    const prev = getRecordByDate(date);
    const snapshot =
      prev?.goalSnapshot ?? {
        bedtimeGoalMinutes: getCurrentGoals().bedtimeGoalMinutes,
        phoneDownGoalMinutes: getCurrentGoals().phoneDownGoalMinutes,
      };

    const nextHome = logStep === "home" ? m : homeM;
    const nextBed = logStep === "bed" ? m : bedM;
    const nextPhone = logStep === "phone" ? m : phoneM;

    persistRecord({
      homeArrivalMinutes: nextHome,
      actualBedtimeMinutes: nextBed,
      actualPhoneDownMinutes: nextPhone,
      goalSnapshot: snapshot,
    });
    setLogStep(null);
  };

  const openTargetsEditor = () => {
    const g = getCurrentGoals();
    setDraftBedGoal(minutesToInputValue(g.bedtimeGoalMinutes));
    setDraftPhoneGoal(minutesToInputValue(g.phoneDownGoalMinutes));
    setTargetsOpen(true);
  };

  const saveTargets = () => {
    const b = parseTimeToMinutes(draftBedGoal);
    const p = parseTimeToMinutes(draftPhoneGoal);
    if (b === null || p === null) return;
    saveCurrentGoals({
      bedtimeGoalMinutes: b,
      phoneDownGoalMinutes: p,
    });
    refresh();
    setTargetsOpen(false);
  };

  const formatTimeLabel = (m: number | null) =>
    m === null ? null : minutesToInputValue(m);

  return (
    <div className="space-y-8 pb-6">
      <FeedbackOverlay
        mode={feedback}
        streakDays={streakForOverlay}
        onDone={() => {
          setFeedback(null);
          setStreakForOverlay(0);
        }}
      />

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("dashboard.subtitle")}
          </p>
          <button
            type="button"
            onClick={() => setDateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-100/90 transition hover:border-violet-300/40 hover:bg-violet-500/15"
          >
            <CalendarDays className="h-3.5 w-3.5 opacity-80" aria-hidden />
            {date}
            {!isToday ? (
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100/90">
                {t("dashboard.past")}
              </span>
            ) : null}
          </button>
        </div>
        <div className="flex shrink-0 gap-2 pt-1">
          <LanguagePicker />
          <Link
            href="/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/35 bg-violet-500/10 text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/15"
            aria-label={t("dashboard.settingsAria")}
            title={t("dashboard.settingsAria")}
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-white/[0.08] bg-[#14121f]/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-7">
        <p className="text-xs font-semibold text-slate-400">
          {isToday ? t("dashboard.targetsToday") : t("dashboard.targetsDay")}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500">{t("dashboard.bedtimeGoal")}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-violet-300 sm:text-4xl">
              {minutesToInputValue(displayGoals.bed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">
              {t("dashboard.screenOffGoal")}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-violet-300 sm:text-4xl">
              {minutesToInputValue(displayGoals.phone)}
            </p>
          </div>
        </div>
        {isToday ? (
          <button
            type="button"
            onClick={openTargetsEditor}
            className="mt-5 text-sm font-semibold text-violet-400 transition hover:text-violet-300"
          >
            {t("dashboard.updateTargets")}
          </button>
        ) : (
          <p className="mt-5 text-xs text-slate-500">{t("dashboard.pastNote")}</p>
        )}
      </section>

      <div className="space-y-3.5">
        <TrackRow
          title={t("dashboard.arrivedHome")}
          subtitle={formatTimeLabel(homeM) ?? t("dashboard.notLoggedYet")}
          active={activeStep === "home"}
          locked={false}
          done={homeM !== null}
          icon={<Home className="h-6 w-6" />}
          onPress={() => openLog("home")}
        />
        <TrackRow
          title={t("dashboard.gotIntoBed")}
          subtitle={formatTimeLabel(bedM) ?? t("dashboard.notLoggedYet")}
          active={activeStep === "bed"}
          locked={homeM === null}
          done={bedM !== null}
          icon={<Bed className="h-6 w-6" />}
          onPress={() => openLog("bed")}
        />
        <TrackRow
          title={t("dashboard.phoneDown")}
          subtitle={formatTimeLabel(phoneM) ?? t("dashboard.notLoggedYet")}
          active={activeStep === "phone"}
          locked={homeM === null || bedM === null}
          done={phoneM !== null}
          icon={<Smartphone className="h-6 w-6" />}
          onPress={() => openLog("phone")}
        />
      </div>

      <Link
        href="/analytics"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-violet-400/35 bg-[#14121f]/90 py-4 text-sm font-bold text-violet-300 shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition hover:border-violet-300/50 hover:bg-[#1a1628] hover:text-violet-200"
      >
        <BarChart3 className="h-5 w-5" aria-hidden />
        {t("dashboard.viewAnalytics")}
      </Link>

      <AnimatePresence>
        {targetsOpen ? (
          <ModalScrim onClose={() => setTargetsOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-sm rounded-5xl border border-white/[0.07] bg-night-900/85 p-7 shadow-zen backdrop-blur-2xl"
            >
              <h2 className="text-lg font-light text-white/95">
                {t("dashboard.modalUpdateTitle")}
              </h2>
              <p className="mt-2 text-xs font-light leading-relaxed text-slate-500">
                {t("dashboard.modalUpdateHelp")}
              </p>
              <div className="mt-6 space-y-4">
                <label className="block text-xs font-light text-slate-500">
                  {t("dashboard.bedtimeGoalField")}
                  <input
                    type="time"
                    value={draftBedGoal}
                    onChange={(e) => setDraftBedGoal(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm font-light text-slate-100 outline-none transition focus:border-white/[0.14] focus:ring-0"
                  />
                </label>
                <label className="block text-xs font-light text-slate-500">
                  {t("dashboard.screenOffGoalField")}
                  <input
                    type="time"
                    value={draftPhoneGoal}
                    onChange={(e) => setDraftPhoneGoal(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm font-light text-slate-100 outline-none transition focus:border-white/[0.14] focus:ring-0"
                  />
                </label>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTargetsOpen(false)}
                  className="flex-1 rounded-full border border-white/[0.08] py-3.5 text-sm font-light text-slate-400 transition hover:bg-white/[0.04]"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={saveTargets}
                  className="flex-1 rounded-full bg-zen-button py-3.5 text-sm font-light text-white/95 shadow-zen-soft ring-1 ring-white/[0.06] transition hover:opacity-95"
                >
                  {t("common.save")}
                </button>
              </div>
            </motion.div>
          </ModalScrim>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {dateOpen ? (
          <ModalScrim onClose={() => setDateOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-sm rounded-5xl border border-white/[0.07] bg-night-900/85 p-7 shadow-zen backdrop-blur-2xl"
            >
              <h2 className="text-lg font-light text-white/95">
                {t("dashboard.pickDay")}
              </h2>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-5 w-full rounded-3xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm font-light text-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={() => setDateOpen(false)}
                className="mt-6 w-full rounded-full bg-zen-button py-3.5 text-sm font-light text-white/95 shadow-zen-soft ring-1 ring-white/[0.06]"
              >
                {t("common.done")}
              </button>
            </motion.div>
          </ModalScrim>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {logStep ? (
          <ModalScrim onClose={() => setLogStep(null)}>
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-sm rounded-5xl border border-white/[0.07] bg-night-900/85 p-7 shadow-zen backdrop-blur-2xl"
            >
              <h2 className="text-lg font-light text-white/95">
                {logStep === "home"
                  ? t("dashboard.logArrivedHome")
                  : logStep === "bed"
                    ? t("dashboard.logGotIntoBed")
                    : t("dashboard.logPhoneDown")}
              </h2>
              <label className="mt-5 block text-xs font-light text-slate-500">
                {t("common.time")}
                <input
                  type="time"
                  value={draftTime}
                  onChange={(e) => setDraftTime(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm font-light text-slate-100 outline-none"
                />
              </label>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setLogStep(null)}
                  className="flex-1 rounded-full border border-white/[0.08] py-3.5 text-sm font-light text-slate-400 transition hover:bg-white/[0.04]"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={saveLogTime}
                  className="flex-1 rounded-full bg-zen-button py-3.5 text-sm font-light text-white/95 shadow-zen-soft ring-1 ring-white/[0.06]"
                >
                  {t("common.save")}
                </button>
              </div>
            </motion.div>
          </ModalScrim>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TrackRow({
  title,
  subtitle,
  active,
  locked,
  done,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  locked: boolean;
  done: boolean;
  icon: ReactNode;
  onPress: () => void;
}) {
  const clickable = !locked;
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => clickable && onPress()}
      className={[
        "flex w-full items-center gap-4 rounded-[1.75rem] px-5 py-5 text-left transition-all duration-300",
        active
          ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-[0_12px_40px_rgba(99,102,241,0.4)] ring-1 ring-white/15"
          : locked
            ? "cursor-not-allowed bg-[#1a1628]/80 text-slate-600 ring-1 ring-white/[0.04]"
            : done
              ? "bg-[#1a1628]/90 text-slate-300 ring-1 ring-white/[0.06] hover:bg-[#221e30]"
              : "bg-[#1a1628]/90 text-slate-400 ring-1 ring-white/[0.06] hover:bg-[#221e30]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
          active ? "bg-white/20 text-white" : "bg-white/[0.08] text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-base font-bold",
            active ? "text-white" : "text-slate-200",
          ].join(" ")}
        >
          {title}
        </span>
        <span
          className={[
            "mt-1 block text-sm",
            active ? "text-white/85" : "text-slate-500",
          ].join(" ")}
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}

function ModalScrim({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/40 p-4 pb-10 backdrop-blur-md sm:items-center sm:pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </motion.div>
  );
}
