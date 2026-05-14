/**
 * Goal snapshot embedded on each record at save time.
 * Changing current goals never mutates historical snapshots.
 */
export type GoalSnapshot = {
  bedtimeGoalMinutes: number;
  phoneDownGoalMinutes: number;
};

export type RecordStatus = "success" | "fail" | "incomplete";

export type DailyRecord = {
  id: string;
  /** Local calendar day YYYY-MM-DD */
  date: string;
  homeArrivalMinutes: number | null;
  actualBedtimeMinutes: number | null;
  actualPhoneDownMinutes: number | null;
  goalSnapshot: GoalSnapshot;
  status: RecordStatus;
  /** Average lateness in minutes (positive = later than goals). Only defined when status is success|fail */
  timeGapMinutes: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CurrentGoals = GoalSnapshot & {
  updatedAt: string;
};

export type UserProfile = {
  email: string;
  username: string;
  avatarUrl: string;
};
