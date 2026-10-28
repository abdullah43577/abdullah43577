const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const startOfUtcDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const addUtcDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const monthWindows = (now: Date, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset + 1, 1));
    const to = offset === 0 ? now : new Date(next.getTime() - 1);
    return { month: from.toISOString().slice(0, 7), from, to };
  });

export const monthLabel = (month: string) => MONTHS[Number(month.slice(5, 7)) - 1] ?? "";

export const monthYearLabel = (month: string) => `${monthLabel(month)} ${month.slice(0, 4)}`;

export const dayRangeLabel = (start: string, end: string) => {
  const [startMonth, endMonth] = [monthLabel(start.slice(0, 7)), monthLabel(end.slice(0, 7))];
  const [startDay, endDay] = [Number(start.slice(8, 10)), Number(end.slice(8, 10))];
  if (start === end) return `${startMonth} ${startDay}`;
  if (startMonth === endMonth) return `${startMonth} ${startDay} – ${endDay}`;
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
};
