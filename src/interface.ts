export interface ContributionDay {
  date: string;
  count: number;
}

export interface MonthlyCommits {
  month: string;
  commits: number;
}

export interface ActivityData {
  days: ContributionDay[];
  months: MonthlyCommits[];
}

export interface LanguageSize {
  name: string;
  size: number;
  color: string | null;
}

export interface Streak {
  length: number;
  start: string | null;
  end: string | null;
}

export interface ActivitySummary {
  commits: number;
  activeDays: number;
  windowDays: number;
  longest: Streak;
  current: Streak;
  months: MonthlyCommits[];
}

export interface ProjectCommits {
  name: string;
  type: "ORG" | "OWN";
  commits: number;
}

export interface LanguageShare {
  name: string;
  percent: number;
  color: string | null;
}
