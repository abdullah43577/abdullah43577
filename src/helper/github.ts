import { UpstreamError } from "./errors";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export interface GraphqlError {
  type?: string;
  message: string;
  path?: (string | number)[];
}

export interface GraphqlResult<T> {
  data: T;
  errors: GraphqlError[];
}

export const githubGraphql = async function <T>(query: string, variables: Record<string, unknown> = {}): Promise<GraphqlResult<T>> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "readme-stats-server",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new UpstreamError(`GitHub responded with ${response.status}`);

  const body = (await response.json()) as { data?: T | null; errors?: GraphqlError[] };
  if (!body.data) throw new UpstreamError(body.errors?.[0]?.message ?? "GitHub returned no data");

  return { data: body.data, errors: body.errors ?? [] };
};
