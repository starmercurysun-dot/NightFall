import type { RecordStatus } from "@/lib/types/record";

/** Minutes from local midnight for a time string "HH:MM" */
export function parseTimeToMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function minutesToInputValue(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** For sleep times after midnight (optional): treat as same "night" if < noon */
export function signedBedGap(actual: number, goal: number): number {
  return actual - goal;
}

export function computeRecordOutcome(input: {
  actualBedtimeMinutes: number | null;
  actualPhoneDownMinutes: number | null;
  goal: { bedtimeGoalMinutes: number; phoneDownGoalMinutes: number };
}): {
  status: RecordStatus;
  timeGapMinutes: number | null;
} {
  const bed = input.actualBedtimeMinutes;
  const phone = input.actualPhoneDownMinutes;
  if (bed === null || phone === null) {
    return { status: "incomplete", timeGapMinutes: null };
  }
  const bedLate = signedBedGap(bed, input.goal.bedtimeGoalMinutes);
  const phoneLate = signedBedGap(phone, input.goal.phoneDownGoalMinutes);
  const timeGapMinutes = (bedLate + phoneLate) / 2;
  const ok =
    bed <= input.goal.bedtimeGoalMinutes &&
    phone <= input.goal.phoneDownGoalMinutes;
  return {
    status: ok ? "success" : "fail",
    timeGapMinutes,
  };
}
