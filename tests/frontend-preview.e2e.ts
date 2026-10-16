import { test, expect } from "@playwright/test";
test("vista previa del CRM: filtros, detalle, notas, cierre y reapertura", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/vista-previa");
  await expect(page.getByText(/Vista previa de desarrollo/)).toBeVisible();
  await page
    .getByRole("link", { name: "Ver solicitudes", exact: true })
    .click();
  await page.getByLabel("Buscar contacto o negocio").fill("no existe");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "No hay solicitudes para estos filtros",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver todas", exact: true }).click();
  await page
    .getByRole("link", { name: "Contacto de ejemplo A", exact: true })
    .click();
  await page
    .getByLabel("Agregar nota", { exact: true })
    .fill("Confirmar alcance en la próxima llamada de ejemplo.");
  await page.getByRole("button", { name: "Agregar nota interna" }).click();
  await expect(
    page.getByText("Confirmar alcance en la próxima llamada de ejemplo.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Estado", exact: true })
    .selectOption("cerrado");
  await page
    .getByRole("combobox", { name: "Resultado de cierre", exact: true })
    .selectOption("ganado");
  await page.getByRole("button", { name: "Aplicar en vista previa" }).click();
  await expect(page.locator(".history")).toContainText(["Nuevo → Cerrado"]);
  await page
    .getByRole("combobox", { name: "Estado", exact: true })
    .selectOption("en_conversacion");
  await page.getByRole("button", { name: "Aplicar en vista previa" }).click();
  await expect(page.locator(".history").first()).toContainText("Reapertura");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/crm-mobile.png",
    fullPage: true,
  });
});
test("órbitas: texto derecho, dentro del hero y alternativa estática", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator(".hero-orbits");
  await expect(hero).toHaveCount(1);
  const positions = await hero.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const captions = [...element.querySelectorAll(".visual-caption")];
    return [0, 4000, 8000, 16000, 24000].flatMap((time) =>
      captions.map((caption) => {
        for (const animation of caption.getAnimations()) {
          animation.pause();
          animation.currentTime = time;
        }
        const box = caption.getBoundingClientRect();
        return {
          time,
          name: caption.textContent,
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          bounds: {
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            bottom: bounds.bottom,
          },
          rotate: getComputedStyle(caption).offsetRotate,
        };
      }),
    );
  });
  for (const position of positions) {
    expect(position.left, JSON.stringify(position)).toBeGreaterThanOrEqual(
      position.bounds.left,
    );
    expect(position.right, JSON.stringify(position)).toBeLessThanOrEqual(
      position.bounds.right,
    );
    expect(position.top, JSON.stringify(position)).toBeGreaterThanOrEqual(
      position.bounds.top,
    );
    expect(position.bottom, JSON.stringify(position)).toBeLessThanOrEqual(
      position.bounds.bottom,
    );
    expect(position.rotate).toBe("0deg");
  }
  await hero.screenshot({ path: "test-results/hero-orbits-mobile.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".visual-caption-top")
      .evaluate((el) => getComputedStyle(el).offsetPath),
  ).toBe("none");
  await page
    .locator("#contacto")
    .screenshot({ path: "test-results/contact-mobile.png" });
});
