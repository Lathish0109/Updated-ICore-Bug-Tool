import { describe, expect, it } from "vitest";

import { RANGE_OPTIONS, resolveDateRange, resolveRange } from "@/lib/date-range";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("resolveRange", () => {
  it("defaults to the 30-day preset when no param is given", () => {
    const result = resolveRange(undefined);
    expect(result.value).toBe("30d");
    expect(result.days).toBe(30);
  });

  it("falls back to the 30-day preset for an unknown value", () => {
    const result = resolveRange("bogus");
    expect(result.value).toBe("30d");
  });

  it("resolves each known preset to the matching day count", () => {
    for (const option of RANGE_OPTIONS) {
      const result = resolveRange(option.value);
      expect(result.value).toBe(option.value);
      expect(result.days).toBe(option.days);
    }
  });

  it("spans exactly `days` between from and to", () => {
    const result = resolveRange("7d");
    expect(result.to.getTime() - result.from.getTime()).toBe(7 * DAY_MS);
  });

  it("`to` is effectively now and `from` is in the past", () => {
    const before = Date.now();
    const result = resolveRange("30d");
    const after = Date.now();
    expect(result.to.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.to.getTime()).toBeLessThanOrEqual(after);
    expect(result.from.getTime()).toBeLessThan(result.to.getTime());
  });
});

describe("resolveDateRange", () => {
  it("uses the range preset when no explicit from/to is given", () => {
    const result = resolveDateRange({ range: "90d" });
    expect(result.value).toBe("90d");
    expect(result.days).toBe(90);
  });

  it("prefers an explicit from/to over the range preset", () => {
    const result = resolveDateRange({ range: "7d", from: "2026-01-01", to: "2026-01-10" });
    expect(result.value).toBe("custom");
    // Both dates are parsed as local time (no "Z" suffix), so assert against
    // local date parts rather than a UTC ISO slice, which can shift by a day
    // depending on the machine's timezone offset.
    expect(
      `${result.from.getFullYear()}-${String(result.from.getMonth() + 1).padStart(2, "0")}-${String(result.from.getDate()).padStart(2, "0")}`,
    ).toBe("2026-01-01");
    expect(
      `${result.to.getFullYear()}-${String(result.to.getMonth() + 1).padStart(2, "0")}-${String(result.to.getDate()).padStart(2, "0")}`,
    ).toBe("2026-01-10");
  });

  it("computes an inclusive day count for a custom range", () => {
    // Jan 1 00:00 through Jan 3 23:59:59.999 spans 3 calendar days.
    const result = resolveDateRange({ from: "2026-01-01", to: "2026-01-03" });
    expect(result.days).toBe(3);
  });

  it("treats a single-day custom range as at least 1 day", () => {
    const result = resolveDateRange({ from: "2026-01-01", to: "2026-01-01" });
    expect(result.days).toBeGreaterThanOrEqual(1);
  });

  it("ignores a partial from/to pair and falls back to the preset", () => {
    const result = resolveDateRange({ range: "7d", from: "2026-01-01" });
    expect(result.value).toBe("7d");
  });
});
