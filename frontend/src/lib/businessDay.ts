import { subHours } from "date-fns";

// SQLite stores timestamps as UTC "YYYY-MM-DD HH:MM:SS" (no zone). `new Date()`
// would read that as local time, so mark it as UTC explicitly.
export function parseDbDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(" ", "T") + "Z");
  }
  return new Date(value);
}

// Hour at which the business day rolls over (Settings → dayStartHour).
// Loaded once at startup; the app reloads the window after settings change.
let dayStartHour = 0;

export function setDayStartHour(hour: unknown) {
  const h = Number(hour);
  dayStartHour = Number.isInteger(h) && h >= 0 && h <= 6 ? h : 0;
}

export function getDayStartHour() {
  return dayStartHour;
}

// Shift an instant so its local calendar date is its business date
// (e.g. with dayStartHour = 3, 01:30 on the 2nd becomes the 1st).
export function toBusinessTime(value: string | Date): Date {
  return subHours(parseDbDate(value), dayStartHour);
}

// Current business "now": use for "today", "this week", "this month".
export function businessNow(): Date {
  return subHours(new Date(), dayStartHour);
}

// Shared filterFn for date-range filters on DB timestamp columns: compares by
// business date, with both ends of the range inclusive.
export function businessDateRangeFilter(
  value: string,
  range?: { from?: Date | string; to?: Date | string }
) {
  if (!range?.from && !range?.to) return true;
  const date = toBusinessTime(value);
  const from = range.from ? new Date(range.from) : null;
  const to = range.to
    ? new Date(new Date(range.to).setHours(23, 59, 59, 999))
    : null;
  if (from && date < new Date(from.setHours(0, 0, 0, 0))) return false;
  if (to && date > to) return false;
  return true;
}
