import type { CurrentGoals, DailyRecord, UserProfile } from "@/lib/types/record";

const SESSION = "nightly_session";
const PROFILE = "nightly_profile";
const GOALS = "nightly_goals";
const RECORDS = "nightly_records";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
}

export function setSessionEmail(email: string) {
  localStorage.setItem(SESSION, email.trim().toLowerCase());
}

export function clearSession() {
  localStorage.removeItem(SESSION);
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  return safeParse<UserProfile | null>(localStorage.getItem(PROFILE), null);
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE, JSON.stringify(profile));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nightly-profile-changed"));
  }
}

export function getCurrentGoals(): CurrentGoals {
  if (typeof window === "undefined") {
    return defaultGoals();
  }
  const parsed = safeParse<CurrentGoals | null>(localStorage.getItem(GOALS), null);
  if (!parsed) return defaultGoals();
  return parsed;
}

export function saveCurrentGoals(goals: Omit<CurrentGoals, "updatedAt">) {
  const payload: CurrentGoals = {
    ...goals,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(GOALS, JSON.stringify(payload));
}

function defaultGoals(): CurrentGoals {
  return {
    bedtimeGoalMinutes: 23 * 60,
    phoneDownGoalMinutes: 23 * 60 + 15,
    updatedAt: new Date().toISOString(),
  };
}

export function listRecords(): DailyRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse<DailyRecord[]>(localStorage.getItem(RECORDS), []);
}

function emitRecordsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("nightly-records-changed"));
}

export function upsertRecord(record: DailyRecord) {
  const all = listRecords().filter((r) => r.id !== record.id);
  all.push(record);
  all.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(RECORDS, JSON.stringify(all));
  emitRecordsChanged();
}

export function getRecordByDate(date: string): DailyRecord | undefined {
  return listRecords().find((r) => r.date === date);
}

export function deleteRecord(id: string) {
  const all = listRecords().filter((r) => r.id !== id);
  localStorage.setItem(RECORDS, JSON.stringify(all));
}
