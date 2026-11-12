/**
 * 宿主跨域搜索：插件注册 provider，宿主并行调用、统一排序。
 * 宿主不读业务表，provider 自己参数化查询；单域失败不影响其他域。
 */
import type { SearchHit, SearchProvider } from "@wb/sdk";

const TIMEOUT_MS = 500;
const MAX_QUERY = 100;

function normalize(q: string): string {
  return String(q ?? "").trim().slice(0, MAX_QUERY);
}

function scoreHit(hit: SearchHit, q: string): number {
  const needle = q.toLowerCase();
  const title = String(hit.title || "").toLowerCase();
  let score = 0;
  if (title === needle) score = 100;
  else if (title.startsWith(needle)) score = 80;
  else if (title.includes(needle)) score = 60;
  if (String(hit.snippet || "").toLowerCase().includes(needle)) score += 20;
  if (hit.url) score += 1;
  return score;
}

export function createSearch(providers: Map<string, SearchProvider>, log: (...args: unknown[]) => void = () => {}) {
  function list() {
    return [...providers.values()].map((p) => ({
      domainId: p.domainId,
      search: typeof p.search === "function",
    })).filter((p) => p.search);
  }

  async function query(input: unknown) {
    const started = Date.now();
    const args = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    const q = normalize(String(args.q ?? ""));
    const limit = Math.max(1, Math.min(50, Number(args.limit) || 20));
    const wanted = Array.isArray(args.domains)
      ? (args.domains as unknown[]).map(String).filter(Boolean)
      : [];
    if (!q) return { q, items: [], domains: list().map((p) => p.domainId), partial: false, failed: [], tookMs: 0 };
    const active = [...providers.values()].filter(
      (p) => typeof p.search === "function" && (wanted.length === 0 || wanted.includes(p.domainId)),
    );
    const failed: string[] = [];
    const batches = await Promise.all(
      active.map(async (provider) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        const timeout = new Promise<SearchHit[]>((resolve) => {
          timer = setTimeout(() => {
            failed.push(provider.domainId);
            resolve([]);
          }, TIMEOUT_MS);
          if (typeof (timer as any).unref === "function") (timer as any).unref();
        });
        try {
          const hits = await Promise.race([
            Promise.resolve(provider.search(q, { limit })).then((x) => (Array.isArray(x) ? x : [])),
            timeout,
          ]);
          return hits.map((hit) => ({ ...hit, domainId: provider.domainId }));
        } catch (error) {
          failed.push(provider.domainId);
          log("search provider failed", provider.domainId, (error as Error)?.message);
          return [];
        } finally {
          if (timer) clearTimeout(timer);
        }
      }),
    );
    const items = batches
      .flat()
      .filter((hit) => hit && hit.id && hit.title)
      .map((hit) => ({ ...hit, score: scoreHit(hit, q) }))
      .sort((a, b) => b.score - a.score || Number(b.at || 0) - Number(a.at || 0) || String(a.title).localeCompare(String(b.title)));
    return {
      q,
      items: items.slice(0, limit * Math.max(1, active.length)).slice(0, 100),
      domains: list().map((p) => p.domainId),
      partial: failed.length > 0,
      failed,
      tookMs: Date.now() - started,
    };
  }

  return { query, list };
}
