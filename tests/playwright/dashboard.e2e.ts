import { expect, test } from "@playwright/test";
import { openModule } from "./demo-navigation";

test("el primer título de la galería espera al scroll para aparecer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/demos");
    const heading = page.locator("#demos-title");
    await expect(heading).toBeVisible();
    expect(
      await heading.evaluate((element) => element.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(viewport.height);
    await heading.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        heading.evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .some((animation) => animation.id === "written-heading"),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        heading
          .locator("[data-written-word]")
          .evaluateAll((elements) =>
            elements.every(
              (element) =>
                getComputedStyle(element).opacity === "1" &&
                getComputedStyle(element).filter === "none",
            ),
          ),
      )
      .toBe(true);
  }
});

test("galería: los títulos grandes y textos secundarios contrastan con el cristal claro", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos");
    for (const selector of [
      ".demos-hub-intro h1",
      "#demos-title",
      "#hub-contact-title",
    ]) {
      const heading = page.locator(selector);
      await expect(heading).toHaveCSS("color", "rgb(17, 17, 17)");
      expect(
        await heading
          .locator("[data-written-word]")
          .evaluateAll((elements) =>
            elements.every(
              (element) =>
                getComputedStyle(element).color === "rgb(17, 17, 17)",
            ),
          ),
      ).toBe(true);
    }
    const contrast = await page
      .locator(
        ".demos-hub-intro > p, .demos-hub-intro > a, .theater-heading > p, .preview-welcome p, .preview-row > span, .demos-hub-contact p",
      )
      .evaluateAll((elements) => {
        const luminance = (rgb: number[]) =>
          rgb
            .map((value) => value / 255)
            .map((value) =>
              value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4,
            )
            .reduce(
              (sum, value, index) =>
                sum + value * [0.2126, 0.7152, 0.0722][index],
              0,
            );
        const background = luminance([245, 244, 240]);
        return elements.map((element) => {
          const foreground = luminance(
            getComputedStyle(element)
              .color.match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number),
          );
          return {
            text: element.textContent,
            ratio:
              (Math.max(background, foreground) + 0.05) /
              (Math.min(background, foreground) + 0.05),
          };
        });
      });
    for (const item of contrast)
      expect(item.ratio, item.text ?? "").toBeGreaterThanOrEqual(4.5);
  }
});

for (const [kind, modules] of [
  ["tienda", ["Punto de venta", "Inventario", "Caja", "Ventas y devoluciones"]],
  ["restaurante", ["Carta", "Mesas y servicio", "Pedido actual", "Cocina"]],
  ["veterinaria", ["Agenda", "Pacientes", "Nueva cita", "Seguimiento"]],
] as const) {
  test(`${kind}: cada módulo tiene contenido propio`, async ({ page }) => {
    await page.goto(`/demos/${kind}`);
    const content = new Set<string>();
    for (const label of modules) {
      await openModule(page, label);
      await expect(page.locator(".dashboard-overview")).toHaveCount(0);
      content.add(await page.locator("#workspace-module").innerText());
    }
    expect(content.size).toBe(modules.length);
  });
}

test("los títulos de landing y demos se escriben al entrar en pantalla", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const [url, id] of [
    ["/", "demo-title"],
    ["/demos", "hub-contact-title"],
  ]) {
    await page.goto(url);
    const heading = page.locator(`#${id}`);
    await heading.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        heading.evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .some((animation) => animation.id === "written-heading"),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        heading
          .locator("[data-written-word]")
          .evaluateAll((elements) =>
            elements.every(
              (element) =>
                getComputedStyle(element).opacity === "1" &&
                getComputedStyle(element).filter === "none",
            ),
          ),
      )
      .toBe(true);
    await expect(heading).toHaveAccessibleName(/.+/);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.locator("#hub-contact-title").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator("#hub-contact-title")
        .evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .some((animation) => animation.id === "written-heading"),
        ),
    )
    .toBe(true);
});

test("la escritura sigue activa con movimiento reducido y se repite al regresar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demos");
  const heading = page.locator("#demos-title");
  for (let visit = 0; visit < 2; visit++) {
    await heading.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        heading.evaluate((element) =>
          element
            .getAnimations({ subtree: true })
            .some((animation) => animation.id === "written-heading"),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        heading
          .locator("[data-written-word]")
          .evaluateAll((elements) =>
            elements.every(
              (element) =>
                getComputedStyle(element).opacity === "1" &&
                getComputedStyle(element).filter === "none",
            ),
          ),
      )
      .toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect
      .poll(() =>
        heading.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBeGreaterThan(page.viewportSize()!.height);
    await expect
      .poll(() =>
        heading.evaluate(
          (element) => element.getAnimations({ subtree: true }).length,
        ),
      )
      .toBe(0);
  }
});

for (const kind of ["tienda", "restaurante", "veterinaria"]) {
  test(`${kind}: panel adaptable y navegación de módulos`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/demos/${kind}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Vista general",
    );
    await expect(
      page
        .getByRole("region", { name: "Resumen de la operación" })
        .getByRole("group"),
    ).toHaveCount(4);
    await page
      .getByLabel("Período del gráfico", { exact: true })
      .selectOption("session");
    await expect(
      page.getByText("Operaciones que realizas en esta demo"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Contraer barra lateral" }).click();
    await expect(
      page.getByRole("button", { name: "Expandir barra lateral" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Expandir barra lateral" }).click();
    await page.screenshot({
      path: `test-results/dashboard-${kind}-desktop.png`,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.getByRole("button", { name: "Abrir menú del sistema" });
    await toggle.click();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page
      .getByRole("navigation", { name: "Módulos de la demo" })
      .getByRole("button", {
        name:
          kind === "veterinaria"
            ? "Nueva cita"
            : kind === "tienda"
              ? "Caja"
              : "Pedido actual",
        exact: true,
      })
      .click();
    await expect(page.locator("#module-title")).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    for (const width of [320, 390, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/dashboard-${kind}-mobile.png`,
    });
  });
}

test("tienda: indicadores y gráfico conectados con una venta", async ({
  page,
}) => {
  await page.goto("/demos/tienda");
  await openModule(page, "Punto de venta");
  await page
    .getByRole("button", { name: "Agregar Arroz 1 kg", exact: true })
    .click();
  await page.getByRole("button", { name: "Ir a caja", exact: true }).click();
  await page.getByRole("button", { name: "Pago exacto", exact: true }).click();
  await page
    .getByRole("button", { name: "Simular venta", exact: true })
    .click();
  await openModule(page, "Resumen");
  await expect(
    page.getByRole("group", { name: "Ventas netas", exact: true }),
  ).toContainText(/S\/\s*5[.,]50/);
  await expect(
    page.getByRole("group", { name: "Unidades en stock", exact: true }),
  ).toContainText("52");
  await page
    .getByLabel("Período del gráfico", { exact: true })
    .selectOption("session");
  await expect(
    page.getByRole("img", { name: /Evolución de ventas/ }),
  ).toHaveAttribute("aria-label", /Evolución de ventas\..*5[.,]50/);
  await page
    .getByRole("button", { name: "Reiniciar demo", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Unidades en stock", exact: true }),
  ).toContainText("53");
});

test("galería: vista previa y cambio entre negocios", async ({ page }) => {
  await page.goto("/demos");
  const gallery = page.locator("#demos");
  await gallery
    .getByRole("button", { name: "Nido / Veterinaria", exact: true })
    .click();
  await gallery.getByRole("button", { name: "Pacientes", exact: true }).click();
  await expect(
    gallery.getByRole("heading", { name: "Pacientes", exact: true }),
  ).toBeVisible();
  await gallery.getByRole("link", { name: "Explorar demo" }).click();
  await page.getByLabel("Cambiar demo", { exact: true }).selectOption("tienda");
  await expect(page).toHaveURL(/\/demos\/tienda$/);
  await expect(
    page.getByRole("group", { name: "Unidades en stock", exact: true }),
  ).toBeVisible();
});
