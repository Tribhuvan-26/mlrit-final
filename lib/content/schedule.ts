/**
 * Scheduling for list items that can be switched on and off or timed, such as
 * the homepage banners. An item shows when it is active and today falls from
 * its start date to its end date, both included. Dates are written
 * YYYY-MM-DD and read as Indian Standard Time days: a banner ending 2026-12-31
 * is still up at 23:59 that night and gone after midnight.
 */
const IST = '+05:30';
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** A date bound in ms, or null when empty or unreadable (an unreadable date never hides an item). */
const bound = (value: unknown, end: boolean): number | null => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  const ms = DAY.test(text)
    ? Date.parse(`${text}${end ? 'T23:59:59.999' : 'T00:00:00'}${IST}`)
    : Date.parse(text);
  return Number.isNaN(ms) ? null : ms;
};

export type Scheduled = { active?: unknown; startDate?: unknown; endDate?: unknown };

export const isScheduledNow = (item: Scheduled, now: number = Date.now()): boolean => {
  if (item.active === false) return false;
  const start = bound(item.startDate, false);
  const end = bound(item.endDate, true);
  return (start === null || now >= start) && (end === null || now <= end);
};

/** Admin validation for a date field: empty is fine, otherwise a real YYYY-MM-DD day. */
export const scheduleDateMessage = (value: unknown): true | string => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return true;
  return DAY.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00${IST}`))
    ? true
    : 'Write the date as YYYY-MM-DD, for example 2026-12-31.';
};
