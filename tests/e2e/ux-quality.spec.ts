import { expect, test } from "@playwright/test";

test("desktop gallery keyboard controls and palette CTA flow", async ({ page }) => {
  await page.goto("/fr/products/door-wood-modern/");
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer = [];
  });

  const mainImage = page.getByTestId("product-main-image");
  const galleryCounter = page.getByTestId("gallery-counter");
  const activeColorName = page.getByTestId("active-color-name");

  await expect(mainImage).toBeVisible();
  await expect(galleryCounter).toContainText(/1\s*\/\s*\d+/);

  await mainImage.focus();
  await page.keyboard.press("ArrowRight");
  await expect(galleryCounter).toContainText(/2\s*\/\s*\d+/);
  await page.keyboard.press("ArrowLeft");
  await expect(galleryCounter).toContainText(/1\s*\/\s*\d+/);

  const beforeColor = (await activeColorName.textContent())?.trim();
  const paletteChip = page.getByTestId("palette-chip-2");
  await paletteChip.scrollIntoViewIfNeeded();
  await paletteChip.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "center", inline: "center" }),
  );
  await paletteChip.click({ force: true });

  const afterColor = (await activeColorName.textContent())?.trim();
  expect(afterColor).toBeTruthy();
  expect(afterColor).not.toBe(beforeColor);

  const paletteCta = page.getByTestId("palette-cta");
  await paletteCta.scrollIntoViewIfNeeded();
  await paletteCta.click({ force: true });
  await expect(page.locator("#lead-form")).toBeInViewport();

  await expect
    .poll(async () =>
      page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = ((window as any).dataLayer || []) as Array<Record<string, string>>;
        return events.some(
          (event) =>
            event.event === "cta_click" &&
            event.channel === "form" &&
            event.placement === "product_palette" &&
            event.locale === "fr",
        );
      }),
    )
    .toBeTruthy();
});

test("mobile swipe interaction and sticky CTA behavior", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only scenario");

  await page.goto("/de/products/door-wood-modern/");

  const mainImage = page.getByTestId("product-main-image");
  const galleryCounter = page.getByTestId("gallery-counter");
  await expect(mainImage).toBeVisible();
  await expect(galleryCounter).toContainText(/1\s*\/\s*\d+/);

  await mainImage.dispatchEvent("touchstart", {
    changedTouches: [{ identifier: 1, clientX: 320, clientY: 240 }],
  });
  await mainImage.dispatchEvent("touchend", {
    changedTouches: [{ identifier: 1, clientX: 110, clientY: 240 }],
  });
  await expect(galleryCounter).toContainText(/2\s*\/\s*\d+/);

  const stickyBar = page.locator(".mobile-sticky-cta");
  await expect(stickyBar).toBeVisible();
  await expect(stickyBar.getByRole("link")).toHaveCount(3);
  await expect(stickyBar.getByRole("link", { name: /whatsapp/i })).toHaveAttribute(
    "href",
    /wa\.me/i,
  );
  await expect(stickyBar.getByRole("link", { name: /anrufen/i })).toHaveAttribute(
    "href",
    /^tel:/,
  );

  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer = [];
  });
  await stickyBar.getByRole("link", { name: /angebot/i }).click({ force: true });
  await expect(page.locator("#lead-form")).toBeInViewport();

  await expect
    .poll(async () =>
      page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = ((window as any).dataLayer || []) as Array<Record<string, string>>;
        return events.some(
          (event) =>
            event.event === "cta_click" &&
            event.channel === "form" &&
            event.placement === "mobile_sticky" &&
            event.locale === "de",
        );
      }),
    )
    .toBeTruthy();
});
