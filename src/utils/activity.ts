import { ActivityData, ActivitySummary, ContributionDay, Streak } from "../interface";

const EMPTY_STREAK: Streak = { length: 0, start: null, end: null };

const longestStreak = (days: ContributionDay[]): Streak => {
  let best = EMPTY_STREAK;
  let run: Streak = EMPTY_STREAK;

  for (const day of days) {
    run = day.count > 0 ? { length: run.length + 1, start: run.start ?? day.date, end: day.date } : EMPTY_STREAK;
    if (run.length > best.length) best = run;
  }

  return best;
};

// A streak is still alive if today has no contributions yet but yesterday did.
const currentStreak = (days: ContributionDay[]): Streak => {
  let index = days.length - 1;
  if (index >= 0 && days[index]!.count === 0) index -= 1;

  const end = days[index];
  if (!end || end.count === 0) return EMPTY_STREAK;

  let start = end;
  while (index > 0 && days[index - 1]!.count > 0) {
    index -= 1;
    start = days[index]!;
  }

  const length = days.indexOf(end) - days.indexOf(start) + 1;
  return { length, start: start.date, end: end.date };
};

export const summariseActivity = ({ days, months }: ActivityData): ActivitySummary => ({
  commits: months.reduce((sum, month) => sum + month.commits, 0),
  activeDays: days.filter(day => day.count > 0).length,
  windowDays: days.length,
  longest: longestStreak(days),
  current: currentStreak(days),
  months,
});
