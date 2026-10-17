import { expect, test, type Locator, type Page } from "@playwright/test";

async function enter(page: Page, selector: string) {
  await page
    .locator(selector)
    .evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "center" }),
    );
}
async function isRevealing(element: Locator) {
  return element.evaluate((node) =>
    node
      .getAnimations()
      .some(
        (animation) =>
          animation.id === "scroll-reveal" && animation.playState === "running",
      ),
  );
}

for (const width of [1440, 390]) {
  test(`scroll ${width}: entrada real, progreso y contenido estable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const heading = page.locator("#sectores .section-heading");
    await expect(page.locator(".scroll-progress")).toBeAttached();
    await expect
      .poll(() =>
        page
          .locator(".scroll-progress")
          .evaluate(
            (node) => new DOMMatrix(getComputedStyle(node).transform).a,
          ),
      )
      .toBe(0);
    await enter(page, "#sectores .section-heading");
    await expect.poll(() => isRevealing(heading)).toBe(true);
    const sample = await heading.evaluate((node) => ({
      opacity: Number(getComputedStyle(node).opacity),
      y: new DOMMatrix(getComputedStyle(node).transform).m42,
    }));
    expect(sample.opacity).toBeLessThan(1);
    expect(sample.y).toBeGreaterThan(0);
    await expect.poll(() => isRevealing(heading)).toBe(false);
    await expect(heading).toHaveCSS("opacity", "1");
    await enter(page, "#contacto");
    await expect
      .poll(() =>
        page
          .locator(".scroll-progress")
          .evaluate(
            (node) => new DOMMatrix(getComputedStyle(node).transform).a,
          ),
      )
      .toBeGreaterThan(0.7);
    // Returning to a visited section keeps reading stable instead of replaying.
    await enter(page, "#sectores .section-heading");
    expect(await isRevealing(heading)).toBe(false);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/scroll-sectores-${width}.png`,
    });
    expect(errors).toEqual([]);
  });
}

test("scroll: los nuevos pedidos se animan y conservan sus controles", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/demos/restaurante");
  await page.getByRole("button", { name: "Agregar Lomo saltado" }).click();
  await page.getByRole("button", { name: "Simular pedido" }).click();
  const order = page.getByRole("article", { name: "Pedido 001", exact: true });
  await enter(page, ".demo-orders article");
  await expect.poll(() => isRevealing(order)).toBe(true);
  await order.getByRole("button", { name: "Pasar a cocina" }).focus();
  await expect.poll(() => isRevealing(order)).toBe(false);
  await expect(order).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(order).toContainText("En cocina");
});

test("scroll: movimiento reducido mantiene todo visible y las demos utilizables", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos/veterinaria");
  await page.getByRole("button", { name: "Ver ficha de Luna" }).click();
  await enter(page, ".demo-pet-record");
  expect(await isRevealing(page.locator(".demo-pet-record"))).toBe(false);
  await expect(page.locator(".demo-pet-record")).toHaveCSS("opacity", "1");
  await page
    .getByLabel("Nota de prueba")
    .fill("Una nota con movimiento reducido.");
  await page.getByRole("button", { name: "Agregar nota a la ficha" }).click();
  await expect(page.getByRole("status")).toContainText("Nota añadida");
  // Changing the preference while visiting the page also enables the observer.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await enter(page, ".demo-appointments");
  await expect
    .poll(() =>
      isRevealing(
        page.getByRole("article", { name: "Cita de Luna", exact: true }),
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      isRevealing(
        page.getByRole("article", { name: "Cita de Luna", exact: true }),
      ),
    )
    .toBe(false);
});

test("scroll: la página sigue legible sin la API de animaciones", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete (Element.prototype as Partial<Element>).animate;
  });
  await page.goto("/");
  const heading = page.locator("#sectores .section-heading");
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS("opacity", "1");
  await expect(heading).toHaveCSS("transform", "none");
  await expect(page.getByRole("link", { name: "Explorar demo" })).toHaveCount(
    3,
  );
});
