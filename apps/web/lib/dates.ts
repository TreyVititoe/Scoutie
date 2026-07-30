/*
 * Calendar-date helpers. Every date in Walter's journey is a calendar day
 * ("2026-08-14"), never an instant, so these deliberately stay in local time.
 *
 * The bug they exist to prevent: `new Date("2026-08-14")` parses as UTC
 * midnight, which is the 13th anywhere west of Greenwich, and
 * `toISOString().split("T")[0]` converts local midnight back to UTC and lands
 * on the previous day for the same timezones. Both shift US users a day.
 * Mobile fixed this class on 07-20; this is the web port.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date -> "YYYY-MM-DD" using local calendar fields. */
export function formatYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" -> local-midnight Date, or null when unparseable. */
export function parseYMD(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

/** Today at local midnight. */
export function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

/** "YYYY-MM-DD" -> "Aug 14". Empty string when unparseable. */
export function formatYMDShort(
  s: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
): string {
  const d = parseYMD(s);
  if (!d) return "";
  return d.toLocaleDateString("en-US", opts);
}
