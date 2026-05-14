"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ArrowLeft, Award, Clock, TrendingUp } from "lucide-react";
import type { Period } from "@/lib/analytics";
import { buildTimeSpentSeries, buildTrendSeries } from "@/lib/analytics";
import type { DailyRecord } from "@/lib/types/record";
import { listRecords } from "@/lib/storage";
import {
  avgHomeToBedMinutes,
  computeSuccessStreak,
  recentActivityRows,
  successRatePercent,
} from "@/lib/stats";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function AnalyticsDashboard() {
  const { t, locale } = useI18n();
  const [period, setPeriod] = useState<Period>("weekly");
  const [records, setRecords] = useState<DailyRecord[]>([]);

  const periodOptions = useMemo(
    () =>
      [
        { id: "daily" as const, label: t("analytics.daily") },
        { id: "weekly" as const, label: t("analytics.weekly") },
        { id: "monthly" as const, label: t("analytics.monthly") },
      ] as const,
    [t],
  );

  const formatDuration = (m: number | null) => {
    if (m === null || Number.isNaN(m)) return t("analytics.durationZero");
    const total = Math.round(m);
    const h = Math.floor(total / 60);
    const min = total % 60;
    return t("analytics.duration", { h, m: min });
  };

  useEffect(() => {
    const refresh = () => setRecords(listRecords());
    refresh();
    window.addEventListener("nightly-records-changed", refresh);
    return () => window.removeEventListener("nightly-records-changed", refresh);
  }, []);

  const gapSeries = useMemo(
    () => buildTrendSeries(records, period),
    [records, period],
  );
  const timeSeries = useMemo(
    () => buildTimeSpentSeries(records, period),
    [records, period],
  );

  const successPct = useMemo(() => successRatePercent(records), [records]);
  const streak = useMemo(() => computeSuccessStreak(records), [records]);
  const avgHomeBed = useMemo(() => avgHomeToBedMinutes(records), [records]);
  const recent = useMemo(() => recentActivityRows(records, 5), [records]);

  const streakDisplayMemo = useMemo(() => {
    if (locale === "zh") return t("feedback.streakZh", { n: streak });
    return streak === 1
      ? t("feedback.streakEnOne")
      : t("feedback.streakEnMany", { n: streak });
  }, [locale, streak, t]);

  const activityLabel = (s: "success" | "fail" | "incomplete") => {
    if (s === "success") return t("activity.onTrack");
    if (s === "fail") return t("activity.missed");
    return t("activity.incomplete");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start gap-3">
        <Link
          href="/tracker"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-white transition hover:bg-violet-500/20"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {t("analytics.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{t("analytics.subtitle")}</p>
        </div>
      </div>

      <div className="flex rounded-full border border-white/[0.08] bg-[#14121f]/80 p-1.5 shadow-inner backdrop-blur-sm">
        {periodOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setPeriod(opt.id)}
            className={`flex-1 rounded-full px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
              period === opt.id
                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatMini
          icon={<Award className="h-5 w-5" />}
          label={t("analytics.successRate")}
          value={`${successPct}%`}
        />
        <StatMini
          icon={<Clock className="h-5 w-5" />}
          label={t("analytics.avgTime")}
          value={formatDuration(avgHomeBed)}
        />
        <StatMini
          icon={<TrendingUp className="h-5 w-5" />}
          label={t("analytics.streak")}
          value={streakDisplayMemo}
        />
      </div>

      <section className="rounded-3xl border border-white/[0.08] bg-[#14121f]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="h-4 w-4" />
          <h2 className="text-sm font-bold text-white">
            {t("analytics.timeSpentTitle")}
          </h2>
        </div>
        {timeSeries.length === 0 ? (
          <p className="mt-8 py-10 text-center text-sm text-slate-500">
            {t("analytics.timeSpentEmpty")}
          </p>
        ) : (
          <div className="mt-4 h-56 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  tickFormatter={(v) =>
                    t("analytics.axisHours", { n: Math.round(v / 60) })
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(12, 10, 20, 0.95)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e8f0",
                  }}
                  formatter={(value: number) => [
                    formatDuration(value),
                    t("analytics.tooltipSpan"),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#c4b5fd", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/[0.08] bg-[#14121f]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h2 className="text-sm font-bold text-white">{t("analytics.gapTrend")}</h2>
        {gapSeries.length === 0 ? (
          <p className="mt-6 py-8 text-center text-sm text-slate-500">
            {t("analytics.gapEmpty")}
          </p>
        ) : (
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gapSeries}>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(12, 10, 20, 0.95)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  formatter={(v: number) => [
                    t("analytics.gapMinutes", { n: Number(v.toFixed(1)) }),
                    t("analytics.tooltipGap"),
                  ]}
                />
                <Line type="monotone" dataKey="gap" stroke="#93b4ff" strokeWidth={2} dot={{ r: 2, fill: "#93b4ff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/[0.08] bg-[#14121f]/95 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <h2 className="text-sm font-bold text-white">
          {t("analytics.recentActivity")}
        </h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {t("analytics.recentEmpty")}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((row) => (
              <li
                key={row.date}
                className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-[#0d0b14]/80 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-300">
                  {row.label}
                </span>
                <span className="text-xs text-violet-300/90">
                  {activityLabel(row.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatMini({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-600/35 via-indigo-600/25 to-violet-800/20 px-2 py-4 text-center shadow-[0_4px_24px_rgba(99,102,241,0.15)] ring-1 ring-white/[0.06] sm:rounded-3xl sm:px-3 sm:py-5">
      <div className="mx-auto flex h-9 w-9 items-center justify-center text-white/90 sm:h-10 sm:w-10">
        {icon}
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-violet-100/80 sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-white sm:text-base">
        {value}
      </p>
    </div>
  );
}
