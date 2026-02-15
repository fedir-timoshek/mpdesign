import { expect, test } from "@playwright/test";

test("fr homepage has lead form and catalog links", async ({ page }) => {
  await page.goto("/fr/");

  await expect(
    page.getByRole("heading", {
      name: /MPDESIGN - Fenetres et portes premium en Suisse/i,
    }),
  ).toBeVisible();
  await expect(page.locator("#lead-form")).toBeVisible();

  const cards = page.locator("article.product-card");
  await expect(cards.first()).toBeVisible();
});

test("lead form fields can be filled without crashing", async ({ page }) => {
  await page.goto("/fr/");

  await page.getByRole("textbox", { name: /nom complet/i }).fill("E2E Test");
  await page.getByRole("textbox", { name: /telephone/i }).fill("+41 79 000 00 00");
  await page.getByRole("textbox", { name: /^email/i }).fill("e2e@example.com");
  await page
    .getByRole("textbox", { name: /votre projet/i })
    .fill("Test lead form typing without submission.");

  // If React throws during hydration or input events, Next's exported runtime shows an "Application error" page.
  await expect(page.getByText(/Application error/i)).toHaveCount(0);
  await expect(page.locator("#lead-form")).toBeVisible();
});

test("de category page renders products", async ({ page }) => {
  await page.goto("/de/windows/pvc/");

  await expect(page.getByRole("heading", { name: /Kunststofffenster/i })).toBeVisible();
  await expect(page.locator("article.product-card").first()).toBeVisible();
});

test("fr/de pages expose canonical and hreflang links", async ({ page }) => {
  await page.goto("/fr/windows/pvc/");

  const frCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(frCanonical || "").toContain("/fr/windows/pvc");
  await expect(
    page.locator('link[rel="alternate"][hreflang="de"]').first(),
  ).toHaveAttribute("href", /\/de\/windows\/pvc\/?$/);

  await page.goto("/de/windows/pvc/");
  const deCanonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(deCanonical || "").toContain("/de/windows/pvc");
  await expect(
    page.locator('link[rel="alternate"][hreflang="fr"]').first(),
  ).toHaveAttribute("href", /\/fr\/windows\/pvc\/?$/);
});
