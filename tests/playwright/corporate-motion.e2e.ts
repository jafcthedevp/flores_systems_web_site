import { expect, test, type Locator } from "@playwright/test";

async function hasLight(heading: Locator) {
  return heading.evaluate((node) =>
    node.getAnimations().some((animation) => animation.id === "heading-light"),
  );
}

async function pauseLight(heading: Locator) {
  await expect.poll(() => hasLight(heading)).toBe(true);
  await heading.evaluate((node) => {
    const animation = node
      .getAnimations()
      .find((item) => item.id === "heading-light")!;
    animation.pause();
    const timing = animation.effect!.getTiming();
    animation.currentTime =
      Number(timing.delay) +
      Number(timing.duration) * (timing.iterations === Infinity ? 0.12 : 0.5);
  });
}

for (const width of [1440, 390]) {
  test(`movimiento corporativo ${width}: luz visible, títulos legibles y repetición controlada`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(
      page.locator(".water-journey, .water-lit-heading, canvas"),
    ).toHaveCount(0);
    const title = page.locator("#solutions-title");
    await title.scrollIntoViewIfNeeded();
    const text = await title.textContent();
    await pauseLight(title);
    await expect(title).toHaveCSS("background-image", /linear-gradient/);
    expect(
      await title.evaluate((node) =>
        parseFloat(getComputedStyle(node).backgroundPosition),
      ),
    ).toBeCloseTo(50, 0);
    const before = await title.boundingBox();
    await page.screenshot({
      path: `test-results/corporate-section-${width}.png`,
    });
    await title.evaluate((node) =>
      node
        .getAnimations()
        .find((item) => item.id === "heading-light")!
        .finish(),
    );
    await expect(title).toHaveCSS("background-image", "none");
    await expect(title).toHaveText(text!);
    expect((await title.boundingBox())!.height).toBeCloseTo(before!.height, 1);
    await page.locator("#contacto h2").scrollIntoViewIfNeeded();
    await title.scrollIntoViewIfNeeded();
    await expect.poll(() => hasLight(title)).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("movimiento corporativo: conserva la luz con cualquier preferencia y la cancela en alto contraste", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("#solutions-title");
  await hero.scrollIntoViewIfNeeded();
  await pauseLight(hero);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await pauseLight(hero);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => hasLight(hero)).toBe(true);
  await expect(hero).toHaveCSS("background-image", /linear-gradient/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const title = page.locator("#solutions-title");
  await title.scrollIntoViewIfNeeded();
  await pauseLight(title);
  await page.emulateMedia({ forcedColors: "active" });
  await expect.poll(() => hasLight(title)).toBe(false);
  await expect(title).toHaveCSS("background-image", "none");
  await expect(title).toHaveCSS("-webkit-text-fill-color", /^rgb\(/);
});

test("movimiento corporativo: el título principal se revela por líneas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("#hero-title .hero-title-line")).toHaveCount(2);
  const delays = await page
    .locator("#hero-title .hero-title-line > span")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: getComputedStyle(node).animationName.split(",")[0].trim(),
        delay: getComputedStyle(node).animationDelay.split(",")[0].trim(),
      })),
    );
  expect(delays).toEqual([
    { name: "title-line-enter", delay: "0.12s" },
    { name: "title-line-enter", delay: "0.3s" },
  ]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const line of await page
    .locator("#hero-title .hero-title-line > span")
    .all()) {
    await expect(line).toHaveCSS("animation-name", /title-line-enter/);
  }
});

test("movimiento corporativo: conserva el contenido sin Web Animations", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    delete (Element.prototype as Partial<Element>).animate;
  });
  await page.goto("/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect(page.locator("#hero-title")).toHaveCSS(
    "background-image",
    "none",
  );
  await page.getByRole("link", { name: "Ver las demos" }).click();
  await expect(page).toHaveURL(/\/demos$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
