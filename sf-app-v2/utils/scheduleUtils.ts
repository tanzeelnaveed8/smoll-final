/**
 * Schedule utilities: build upcoming dates for date/time selection.
 * No mock data; dates are generated from today.
 */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface DatePill {
  id: string;
  labelTop: string;
  labelBottom: string;
}

export function buildUpcomingDates(count: number): DatePill[] {
  const today = new Date();
  const days: DatePill[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      id: d.toISOString().slice(0, 10),
      labelTop: WEEKDAYS[d.getDay()],
      labelBottom: String(d.getDate()),
    });
  }
  return days;
}
