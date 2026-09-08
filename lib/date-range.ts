export const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
] as const;

export type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

const DEFAULT_RANGE: RangeValue = "30d";

export function resolveRange(param: string | undefined) {
  const option = RANGE_OPTIONS.find((r) => r.value === param) ?? RANGE_OPTIONS[1];
  const to = new Date();
  const from = new Date(to.getTime() - option.days * 24 * 60 * 60 * 1000);
  return { value: option.value, days: option.days, from, to };
}

/** Like resolveRange, but an explicit from/to (YYYY-MM-DD) takes priority
 * over the range preset -- used where a custom date range picker is offered
 * alongside the quick presets. */
export function resolveDateRange(params: { range?: string; from?: string; to?: string }) {
  if (params.from && params.to) {
    const from = new Date(`${params.from}T00:00:00`);
    const to = new Date(`${params.to}T23:59:59.999`);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));
    return { value: "custom" as const, days, from, to };
  }
  const resolved = resolveRange(params.range);
  return { ...resolved, value: resolved.value as RangeValue | "custom" };
}

export { DEFAULT_RANGE };
