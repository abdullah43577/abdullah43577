import { cached } from "../helper/cache";
import { ActivitySummary, LanguageShare, ProjectCommits } from "../interface";
import { GithubRepository } from "../repositories/github.repository";
import { CardName, ThemeName } from "../schemas/card";
import { summariseActivity } from "../utils/activity";
import { configuredRepos, getCardsConfig } from "../utils/cardsConfig";
import { renderLanguages } from "../utils/cards/languages";
import { renderMonthly } from "../utils/cards/monthly";
import { renderOverview } from "../utils/cards/overview";
import { renderProjects } from "../utils/cards/projects";
import { palettes } from "../utils/cards/theme";
import { renderUnavailable } from "../utils/cards/unavailable";
import { toLanguageShares } from "../utils/languages";

export class CardService {
  private githubRepo = new GithubRepository();

  private get login() {
    return process.env.GITHUB_USERNAME as string;
  }

  async renderCard(card: CardName, theme: ThemeName) {
    const palette = palettes[theme];

    switch (card) {
      case "overview":
        return renderOverview(await this.getActivity(), palette, this.login);
      case "monthly":
        return renderMonthly((await this.getActivity()).months, palette);
      case "projects":
        return renderProjects(await this.getProjectCommits(), palette);
      case "languages":
        return renderLanguages(await this.getLanguages(), palette);
    }
  }

  async warmCache() {
    const results = await Promise.allSettled([this.getActivity(), this.getProjectCommits(), this.getLanguages()]);
    const failed = results.filter(result => result.status === "rejected").length;
    console.log(failed ? `⚠️  Cache warmed with ${failed} failed data set(s)` : "✅ Card data cached");
  }

  renderUnavailable(theme: ThemeName) {
    return renderUnavailable(palettes[theme]);
  }

  private getActivity(): Promise<ActivitySummary> {
    return cached("activity", async () => summariseActivity(await this.githubRepo.fetchActivity(this.login, new Date())));
  }

  private getProjectCommits(): Promise<ProjectCommits[]> {
    return cached("projects", async () => {
      const userId = await this.githubRepo.fetchUserId(this.login);
      const counts = await this.githubRepo.fetchRepoCommits(userId, configuredRepos());

      return getCardsConfig().projects.map(project => ({
        name: project.name,
        type: project.type,
        commits: project.repos.reduce((sum, repo) => sum + (counts.get(repo) ?? 0), 0),
      }));
    });
  }

  private getLanguages(): Promise<LanguageShare[]> {
    return cached("languages", async () => {
      const sizes = await this.githubRepo.fetchLanguageSizes(this.login, configuredRepos());
      return toLanguageShares(sizes, getCardsConfig().excludeLanguages);
    });
  }
}
