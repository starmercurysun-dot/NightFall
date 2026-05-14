import type { DailyRecord } from "@/lib/types/record";

export type Period = "daily" | "weekly" | "monthly";

export type TrendPoint = {
  label: string;
  /** ISO-ish key for sorting */
  key: string;
  gap: number;
};

export type TimeSpentPoint = {
  label: string;
  key: string;
  minutes: number;
};

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // days since Monday
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatWeekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (x: Date) =>
    `${x.getMonth() + 1}/${x.getDate()}`;
  return `${fmt(start)}–${fmt(end)}`;
}

export function buildTrendSeries(
  records: DailyRecord[],
  period: Period,
): TrendPoint[] {
  const scored = records.filter(
    (r) =>
      (r.status === "success" || r.status === "fail") &&
      r.timeGapMinutes !== null,
  );

  if (period === "daily") {
    return scored
      .map((r) => ({
        key: r.date,
        label: r.date.slice(5),
        gap: r.timeGapMinutes ?? 0,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  if (period === "weekly") {
    const buckets = new Map<
      string,
      { sum: number; count: number; start: Date }
    >();
    for (const r of scored) {
      const d = new Date(`${r.date}T12:00:00`);
      const start = startOfWeekMonday(d);
      const key = start.toISOString().slice(0, 10);
      const prev = buckets.get(key);
      const gap = r.timeGapMinutes ?? 0;
      if (!prev) {
        buckets.set(key, { sum: gap, count: 1, start });
      } else {
        prev.sum += gap;
        prev.count += 1;
      }
    }
    return Array.from(buckets.entries())
      .map(([key, v]) => ({
        key,
        label: formatWeekLabel(v.start),
        gap: v.sum / v.count,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  const buckets = new Map<string, { sum: number; count: number }>();
  for (const r of scored) {
    const key = r.date.slice(0, 7); // YYYY-MM
    const gap = r.timeGapMinutes ?? 0;
    const prev = buckets.get(key);
    if (!prev) buckets.set(key, { sum: gap, count: 1 });
    else {
      prev.sum += gap;
      prev.count += 1;
    }
  }
  return Array.from(buckets.entries())
    .map(([key, v]) => ({
      key,
      label: key,
      gap: v.sum / v.count,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** Minutes from home arrival to bedtime (same day). */
export function buildTimeSpentSeries(
  records: DailyRecord[],
  period: Period,
): TimeSpentPoint[] {
  const usable = records.filter(
    (r) =>
      r.homeArrivalMinutes !== null &&
      r.actualBedtimeMinutes !== null,
  );

  const point = (r: DailyRecord): TimeSpentPoint => ({
    key: r.date,
    label: r.date.slice(5),
    minutes:
      (r.actualBedtimeMinutes ?? 0) - (r.homeArrivalMinutes ?? 0),
  });

  if (period === "daily") {
    return usable
      .map(point)
      .filter((p) => p.minutes >= 0 && p.minutes < 24 * 60)
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  if (period === "weekly") {
    const buckets = new Map<
      string,
      { sum: number; count: number; start: Date }
    >();
    for (const r of usable) {
      const m =
        (r.actualBedtimeMinutes ?? 0) - (r.homeArrivalMinutes ?? 0);
      if (m < 0 || m >= 24 * 60) continue;
      const d = new Date(`${r.date}T12:00:00`);
      const start = startOfWeekMonday(d);
      const key = start.toISOString().slice(0, 10);
      const prev = buckets.get(key);
      if (!prev) buckets.set(key, { sum: m, count: 1, start });
      else {
        prev.sum += m;
        prev.count += 1;
      }
    }
    return Array.from(buckets.entries())
      .map(([key, v]) => ({
        key,
        label: formatWeekLabel(v.start),
        minutes: v.sum / v.count,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  const buckets = new Map<string, { sum: number; count: number }>();
  for (const r of usable) {
    const m =
      (r.actualBedtimeMinutes ?? 0) - (r.homeArrivalMinutes ?? 0);
    if (m < 0 || m >= 24 * 60) continue;
    const key = r.date.slice(0, 7);
    const prev = buckets.get(key);
    if (!prev) buckets.set(key, { sum: m, count: 1 });
    else {
      prev.sum += m;
      prev.count += 1;
    }
  }
  return Array.from(buckets.entries())
    .map(([key, v]) => ({
      key,
      label: key,
      minutes: v.sum / v.count,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}
