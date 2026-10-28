import { githubGraphql, GraphqlResult } from "../helper/github";
import { ActivityData, LanguageSize } from "../interface";
import { addUtcDays, monthWindows, startOfUtcDay, toIsoDate } from "../utils/dates";

interface LanguageEdges {
  edges: { size: number; node: { name: string; color: string | null } }[];
}

interface RepoLanguages {
  nameWithOwner: string;
  languages: LanguageEdges;
}

interface OwnedReposPage {
  user: { repositories: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: RepoLanguages[] } };
}

const LANGUAGES_FIELDS = "nameWithOwner languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } }";

const splitRepo = (repo: string) => {
  const [owner, name] = repo.split("/");
  return { owner: JSON.stringify(owner), name: JSON.stringify(name) };
};

const warnMissing = (errors: { message: string }[], context: string) => {
  if (errors.length) console.warn(`⚠️  ${context}: ${errors.map(error => error.message).join("; ")}`);
};

export class GithubRepository {
  async fetchUserId(login: string) {
    const { data } = await githubGraphql<{ user: { id: string } }>("query($login: String!) { user(login: $login) { id } }", { login });
    return data.user.id;
  }

  async fetchActivity(login: string, now: Date): Promise<ActivityData> {
    const from = addUtcDays(startOfUtcDay(now), -364);
    const windows = monthWindows(now, 12);

    const monthFields = windows
      .map((window, index) => `m${index}: contributionsCollection(from: "${window.from.toISOString()}", to: "${window.to.toISOString()}") { totalCommitContributions }`)
      .join("\n");

    const query = `query($login: String!) {
      user(login: $login) {
        calendar: contributionsCollection(from: "${from.toISOString()}", to: "${now.toISOString()}") {
          contributionCalendar { weeks { contributionDays { date contributionCount } } }
        }
        ${monthFields}
      }
    }`;

    type CalendarWeeks = { weeks: { contributionDays: { date: string; contributionCount: number }[] }[] };
    type ActivityResponse = { user: Record<string, { totalCommitContributions: number }> & { calendar: { contributionCalendar: CalendarWeeks } } };

    const { data } = await githubGraphql<ActivityResponse>(query, { login });
    const today = toIsoDate(now);

    const days = data.user.calendar.contributionCalendar.weeks
      .flatMap(week => week.contributionDays)
      .filter(day => day.date <= today)
      .map(day => ({ date: day.date, count: day.contributionCount }));

    const months = windows.map((window, index) => ({
      month: window.month,
      commits: data.user[`m${index}`]?.totalCommitContributions ?? 0,
    }));

    return { days, months };
  }

  async fetchRepoCommits(userId: string, repos: string[]): Promise<Map<string, number>> {
    if (!repos.length) return new Map();

    const fields = repos
      .map((repo, index) => {
        const { owner, name } = splitRepo(repo);
        return `r${index}: repository(owner: ${owner}, name: ${name}) { defaultBranchRef { target { ... on Commit { history(author: { id: $userId }) { totalCount } } } } }`;
      })
      .join("\n");

    type RepoHistory = { defaultBranchRef: { target: { history?: { totalCount: number } } } | null } | null;
    const { data, errors } = await githubGraphql<Record<string, RepoHistory>>(`query($userId: ID!) {\n${fields}\n}`, { userId });
    warnMissing(errors, "Some project repos could not be read");

    return new Map(repos.map((repo, index) => [repo, data[`r${index}`]?.defaultBranchRef?.target.history?.totalCount ?? 0]));
  }

  async fetchLanguageSizes(login: string, extraRepos: string[]): Promise<LanguageSize[]> {
    const repos = new Map<string, LanguageEdges>();

    let cursor: string | null = null;
    do {
      const result: GraphqlResult<OwnedReposPage> = await githubGraphql<OwnedReposPage>(
        `query($login: String!, $cursor: String) {
          user(login: $login) {
            repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false) {
              pageInfo { hasNextPage endCursor }
              nodes { ${LANGUAGES_FIELDS} }
            }
          }
        }`,
        { login, cursor },
      );
      const page = result.data.user.repositories;
      for (const repo of page.nodes) repos.set(repo.nameWithOwner.toLowerCase(), repo.languages);
      cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    } while (cursor);

    const missing = extraRepos.filter(repo => !repos.has(repo.toLowerCase()));
    if (missing.length) {
      const fields = missing
        .map((repo, index) => {
          const { owner, name } = splitRepo(repo);
          return `r${index}: repository(owner: ${owner}, name: ${name}) { ${LANGUAGES_FIELDS} }`;
        })
        .join("\n");
      const { data, errors } = await githubGraphql<Record<string, RepoLanguages | null>>(`query {\n${fields}\n}`);
      warnMissing(errors, "Some project repos had no readable languages");
      for (const repo of Object.values(data)) if (repo) repos.set(repo.nameWithOwner.toLowerCase(), repo.languages);
    }

    const totals = new Map<string, LanguageSize>();
    for (const { edges } of repos.values()) {
      for (const { size, node } of edges) {
        const entry = totals.get(node.name) ?? { name: node.name, size: 0, color: node.color };
        entry.size += size;
        totals.set(node.name, entry);
      }
    }

    return [...totals.values()];
  }
}
