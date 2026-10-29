import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`landing ${width}: presenta los servicios y lleva al espacio de demos`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".product-preview")).toHaveCount(0);
    await expect(
      page
        .locator("#soluciones")
        .getByRole("heading", { name: "Sistemas administrativos" }),
    ).toBeVisible();
    const invitation = page.locator("#demos");
    await invitation.scrollIntoViewIfNeeded();
    await expect(invitation.getByRole("heading")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await invitation.screenshot({
      path: `test-results/landing-invitation-${width}.png`,
    });
    await invitation
      .getByRole("link", { name: "Ir al espacio de demos" })
      .click();
    await expect(page).toHaveURL(/\/demos$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Encuentra posibilidades",
    );
    await page
      .getByRole("navigation", { name: "Acceso directo a las demos" })
      .getByRole("link", { name: "Restaurante" })
      .click();
    await expect(page).toHaveURL(/\/demos\/restaurante$/);
    await page.getByRole("link", { name: "Volver a las demos" }).click();
    await expect(page).toHaveURL(/\/demos$/);
    expect(errors).toEqual([]);
  });
}

test("escaparate: cambiar negocio, navegar la interfaz y abrir la demo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/demos");
  const showcase = page.locator("#demos");
  await showcase.getByRole("button", { name: "Nido / Veterinaria" }).click();
  await expect(
    showcase.getByRole("heading", { name: "La agenda de hoy" }),
  ).toBeVisible();
  await showcase
    .getByRole("button", { name: "Pacientes", exact: true })
    .click();
  await expect(
    showcase.getByRole("heading", { name: "Pacientes", exact: true }),
  ).toBeVisible();
  await showcase.getByRole("link", { name: "Explorar demo" }).click();
  await expect(page).toHaveURL(/demos\/veterinaria/);
  await page
    .getByRole("navigation", { name: "Módulos de la demo" })
    .getByRole("button", { name: "Nueva cita" })
    .click();
  await expect(page.locator(".demo-panel")).toBeFocused();
  await page.getByLabel("Cambiar demo", { exact: true }).selectOption("tienda");
  await expect(page).toHaveURL(/demos\/tienda/);
  await expect(
    page.getByRole("heading", { name: "Venta de ejemplo" }),
  ).toBeVisible();
});

test("escaparate móvil sin desbordamiento", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demos");
  const showcase = page.locator("#demos");
  await showcase.getByRole("button", { name: "Punto / Tienda" }).click();
  await expect(
    showcase.getByRole("heading", { name: "Tu negocio, a la vista" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await showcase.screenshot({ path: "test-results/showcase-mobile.png" });
});

for (const width of [1440, 390]) {
  test(`interacción ${width}: carga sincronizada, confirmación y repetición`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const card = page.locator("[data-demo=response]");
    await card.getByRole("button", { name: "Probar interacción" }).click();
    const button = card.getByRole("button", { name: "Procesando" });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    const progress = card.getByRole("progressbar", {
      name: "Progreso de la interacción",
    });
    await expect(progress).toBeVisible();
    await expect
      .poll(async () => Number(await progress.getAttribute("aria-valuenow")))
      .toBeGreaterThan(20);
    const value = Number(await progress.getAttribute("aria-valuenow"));
    const offset = Number(
      await card
        .locator(".response-ring-fill")
        .getAttribute("stroke-dashoffset"),
    );
    expect(Math.abs(value + offset - 100)).toBeLessThanOrEqual(4);
    await card.screenshot({
      path: `test-results/response-loading-${width}.png`,
    });
    await expect(card.getByRole("status")).toHaveText("Acción confirmada");
    const retry = card.getByRole("button", { name: "Probar de nuevo" });
    await expect(retry).toBeEnabled();
    await expect(card.locator(".response-ring-fill")).toHaveAttribute(
      "stroke-dashoffset",
      "0",
    );
    await card.screenshot({
      path: `test-results/response-complete-${width}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await retry.click();
    await expect(
      card.getByRole("button", { name: "Procesando" }),
    ).toBeDisabled();
    await page
      .getByRole("link", { name: "Ver las demos", exact: true })
      .click();
    await expect(page).toHaveURL(/\/demos$/);
    expect(errors).toEqual([]);
  });
}

for (const width of [1440, 390]) {
  test(`sellos ${width}: logos, marquee, pausa y navegación por teclado`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const strip = page.locator(".integration-strip");
    await strip.evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "center" }),
    );
    await expect(strip.getByRole("listitem")).toHaveCount(10);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll(".integration-strip img")).every(
        (image) =>
          (image as HTMLImageElement).complete &&
          (image as HTMLImageElement).naturalWidth > 0,
      ),
    );
    const track = strip.locator(".integration-track");
    const translation = () =>
      track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    const initial = await translation();
    await expect.poll(translation).toBeLessThan(initial - 3);
    await strip
      .getByRole("button", { name: "Pausar movimiento de integraciones" })
      .click();
    await expect(track).toHaveCSS("animation-play-state", "paused");
    await strip
      .getByRole("button", { name: "Reanudar movimiento de integraciones" })
      .click();
    await expect(track).toHaveCSS("animation-play-state", "running");
    const viewport = strip.getByRole("region");
    await viewport.hover();
    await expect(track).toHaveCSS("animation-play-state", "paused");
    await viewport.focus();
    await expect(track).toHaveCSS("animation-name", "none");
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => viewport.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await strip.screenshot({
      path: `test-results/integrations-marquee-${width}.png`,
    });
  });
}
