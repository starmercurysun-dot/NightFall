import type { DailyRecord } from "@/lib/types/record";

/** Consecutive success days from the most recent scored day backward. */
export function computeSuccessStreak(records: DailyRecord[]): number {
  const sorted = [...records]
    .filter((r) => r.status === "success" || r.status === "fail")
    .sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const r of sorted) {
    if (r.status === "success") streak++;
    else break;
  }
  return streak;
}

export function successRatePercent(records: DailyRecord[]): number {
  const scored = records.filter(
    (r) => r.status === "success" || r.status === "fail",
  );
  if (scored.length === 0) return 0;
  const wins = scored.filter((r) => r.status === "success").length;
  return Math.round((wins / scored.length) * 100);
}

/** Average minutes from home arrival to bedtime (same calendar day). */
export function avgHomeToBedMinutes(records: DailyRecord[]): number | null {
  const vals = records
    .filter(
      (r) =>
        r.homeArrivalMinutes !== null &&
        r.actualBedtimeMinutes !== null,
    )
    .map((r) => (r.actualBedtimeMinutes ?? 0) - (r.homeArrivalMinutes ?? 0))
    .filter((m) => m >= 0 && m < 24 * 60);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export type RecentRow = {
  date: string;
  label: string;
  status: "success" | "fail" | "incomplete";
};

export function recentActivityRows(
  records: DailyRecord[],
  limit = 6,
): RecentRow[] {
  return [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((r) => ({
      date: r.date,
      label: r.date,
      status: r.status,
    }));
}
