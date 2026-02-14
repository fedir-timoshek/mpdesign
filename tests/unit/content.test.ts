import { describe, expect, it } from "vitest";
import { getCategoryByMaterial, getCategoryPath, getSeoForPage } from "@/lib/content";

describe("content helpers", () => {
  it("maps material to category", () => {
    expect(getCategoryByMaterial("pvc")).toBe("windows-pvc");
    expect(getCategoryByMaterial("wood")).toBe("windows-wood");
    expect(getCategoryByMaterial("aluminum")).toBe("windows-aluminum");
    expect(getCategoryByMaterial("unknown")).toBeNull();
  });

  it("builds category paths for locales", () => {
    expect(getCategoryPath("doors", "fr")).toBe("/fr/doors");
    expect(getCategoryPath("windows-pvc", "de")).toBe("/de/windows/pvc");
    expect(getCategoryPath("shutters", "fr")).toBe("/fr/shutters");
  });

  it("returns SEO defaults", () => {
    const seo = getSeoForPage("fr");
    expect(seo.title).toContain("MPDESIGN");
    expect(seo.description.length).toBeGreaterThan(20);
  });
});
