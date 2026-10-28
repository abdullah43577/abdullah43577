# readme-stats-server

Serves the SVG activity cards on the [abdullah43577](https://github.com/abdullah43577) GitHub profile README. A small Express + TypeScript service that reads GitHub's GraphQL API with a personal token, so private and organisation work is counted, and renders four cards in a light and a dark theme.

The approved design lives in [`design/`](../design): `readme-mock.html` is the profile mockup, `cards/` the card designs, `profile-readme.md` the README that embeds them.

## Cards

| Card | Endpoint | Shows |
| --- | --- | --- |
| Overview | `GET /v1/cards/overview` | Commits in the past 12 months, active days, longest and current contribution streak |
| Monthly | `GET /v1/cards/monthly` | Commits per month for 12 months, the current month highlighted |
| Projects | `GET /v1/cards/projects` | All-time commits per project, from the repos listed in `cards.config.json` |
| Languages | `GET /v1/cards/languages` | Top five languages by bytes across owned repos and configured project repos |

Every card takes `?theme=light|dark` (default `light`). `GET /health` answers `{ message, data: { status: "ok" } }`.

Embed a card so GitHub picks the theme:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://<host>/v1/cards/overview?theme=dark" />
  <img width="816" src="https://<host>/v1/cards/overview?theme=light" alt="Activity over the past twelve months" />
</picture>
```

## Setup

```bash
npm install
cp .env.example .env
cp cards.config.example.json cards.config.json
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `PORT` | Port to listen on |
| `GITHUB_TOKEN` | Classic personal access token with `repo` and `read:user`. `repo` is what lets private and organisation commits count; an organisation using SSO must authorise the token |
| `GITHUB_USERNAME` | The account the cards describe |
| `CACHE_TTL_MINUTES` | How long GitHub data is reused, default `60`, minimum `5` |
| `CARDS_CONFIG` | Optional. The contents of `cards.config.json` as one line of JSON, for hosts where the file is not deployed |

`cards.config.json` is gitignored because it names private organisation repos. It maps repos to the project names shown on the Projects card, marks each project `ORG` or `OWN`, and can exclude languages.

## How it behaves

- GitHub is queried only on a cache miss. Each data set (activity, projects, languages) is cached in memory for `CACHE_TTL_MINUTES`, and concurrent misses share one request.
- If a refresh fails, the last good data is served. If there is none yet, the card renders a small "temporarily unavailable" card rather than a broken image.
- Bad card names or themes answer `400` with the usual `{ message, errors }` body.
- Commit counts follow GitHub's own rules: a commit counts when its author email is linked to the account. Project counts read the default branch of each configured repo.
