import { expect, test } from "@playwright/test";

test("product gallery and palette interactions are usable", async ({ page }) => {
  await page.goto("/fr/products/door-wood-modern/");

  const mainImage = page.getByTestId("product-main-image");
  const galleryCounter = page.getByTestId("gallery-counter");
  const activeColorName = page.getByTestId("active-color-name");

  await expect(mainImage).toBeVisible();
  await expect(galleryCounter).toContainText(/1\s*\/\s*\d+/);

  await page.getByTestId("thumb-1").click({ force: true });
  await expect(galleryCounter).toContainText(/2\s*\/\s*\d+/);

  const beforeColor = (await activeColorName.textContent())?.trim();
  const paletteChip = page.getByTestId("palette-chip-1");
  await paletteChip.scrollIntoViewIfNeeded();
  await paletteChip.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "center", inline: "center" }),
  );
  await paletteChip.click({ force: true });

  await expect(activeColorName).toBeVisible();
  const afterColor = (await activeColorName.textContent())?.trim();
  expect(afterColor).not.toBe(beforeColor);

  const paletteCta = page.getByTestId("palette-cta");
  await paletteCta.scrollIntoViewIfNeeded();
  await paletteCta.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "center", inline: "center" }),
  );
  await paletteCta.click({ force: true });
  await expect(page.locator("#lead-form")).toBeInViewport();
});
