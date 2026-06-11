import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  subMonths,
  format,
  isToday,
  isYesterday,
  isSameMonth,
  getDaysInMonth,
  getDate,
} from "date-fns";

export function monthBounds(ref = new Date()) {
  return { start: startOfMonth(ref), end: endOfMonth(ref) };
}

export function lastMonthBounds(ref = new Date()) {
  return monthBounds(subMonths(ref, 1));
}

export function inMonth(dateStr, ref = new Date()) {
  return isSameMonth(new Date(dateStr), ref);
}

// "Today", "Yesterday", or "Tue, 10 Jun"
export function dayLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, d MMM");
}

export function dayKey(dateStr) {
  return startOfDay(new Date(dateStr)).toISOString();
}

export function timeLabel(dateStr) {
  return format(new Date(dateStr), "h:mm a");
}

export function monthLabel(ref = new Date()) {
  return format(ref, "MMMM");
}

// How far through the current month we are (1-based day / total days) — used to
// project the month-end total from the pace so far.
export function monthProgress(ref = new Date()) {
  const dayOfMonth = getDate(ref);
  const total = getDaysInMonth(ref);
  return { dayOfMonth, total, fraction: dayOfMonth / total };
}
