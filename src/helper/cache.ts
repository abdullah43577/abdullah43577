interface Entry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export const cacheTtlMs = () => Math.max(5, Number(process.env.CACHE_TTL_MINUTES) || 60) * 60_000;

// A failed refresh serves the last good value, so a GitHub outage never blanks a card that rendered before.
export const cached = async function <T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const request = load()
    .then(value => {
      store.set(key, { value, expiresAt: Date.now() + cacheTtlMs() });
      return value;
    })
    .catch(error => {
      if (!hit) throw error;
      console.warn(`⚠️  Refreshing "${key}" failed, serving the cached value:`, error instanceof Error ? error.message : error);
      return hit.value as T;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, request);
  return request;
};
