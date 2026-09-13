import { describe, expect, it } from "vitest";

import { csvEscape } from "@/lib/csv";

describe("csvEscape", () => {
  it("leaves a plain value unchanged", () => {
    expect(csvEscape("Login button broken")).toBe("Login button broken");
  });

  it("wraps a value containing a comma in quotes", () => {
    expect(csvEscape("Bug, but only on Safari")).toBe('"Bug, but only on Safari"');
  });

  it("wraps a value containing a double quote and escapes it", () => {
    expect(csvEscape('Says "Error" on submit')).toBe('"Says ""Error"" on submit"');
  });

  it("wraps a value containing a newline", () => {
    expect(csvEscape("Line one\nLine two")).toBe('"Line one\nLine two"');
  });

  it("converts null/undefined to an empty string", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("stringifies a number without quoting", () => {
    expect(csvEscape(42)).toBe("42");
  });
});
