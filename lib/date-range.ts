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

export { DEFAULT_RANGE };
