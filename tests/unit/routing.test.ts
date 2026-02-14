import { describe, expect, it } from "vitest";
import { isLocale, normalizePath, switchLocalePath } from "@/lib/routing";

describe("routing helpers", () => {
  it("validates locales", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("de")).toBe(true);
    expect(isLocale("ru")).toBe(false);
  });

  it("switches locale in path", () => {
    expect(switchLocalePath("/fr/products/abc", "de")).toBe("/de/products/abc");
    expect(switchLocalePath("/de/windows/pvc", "fr")).toBe("/fr/windows/pvc");
    expect(switchLocalePath("/", "fr")).toBe("/fr");
  });

  it("normalizes trailing slash", () => {
    expect(normalizePath("/fr/")).toBe("/fr");
    expect(normalizePath("/fr")).toBe("/fr");
  });
});
