import { expect, test } from "@playwright/test";
test("landing, navegación móvil y movimiento reducido", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Que el trabajo fluya",
  );
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeFocused();
  expect(
    await page
      .locator(".specialties-track")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("specialties-scroll");
  await expect(page.locator(".specialties-track")).toHaveCSS(
    "animation-duration",
    "70s",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page.screenshot({ path: "test-results/hero-mobile.png" });
});
test("el formulario valida sin perder datos ni simular éxito", async ({
  page,
}) => {
  const keys: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") {
      const key = request
        .postData()
        ?.match(
          /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i,
        )?.[0];
      if (key) keys.push(key);
    }
  });
  await page.goto("/#contacto");
  const form = page.locator('form[aria-labelledby="quote-title"]');
  await form.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.locator("#name")).toBeFocused();
  await page
    .getByLabel("Tu nombre", { exact: true })
    .fill("Contacto de prueba");
  await page.getByLabel("Nombre del negocio").fill("Negocio ficticio");
  await page.getByLabel("Tipo de negocio").selectOption("veterinaria");
  await page.getByLabel("Servicio de interés").selectOption("ambos");
  await page
    .getByLabel("¿Qué necesitas mejorar?")
    .fill("Necesito organizar las citas del negocio de ejemplo.");
  await page.locator("#email").fill("prueba@example.com");
  await page.locator("#consent").check();
  await form.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(form.getByRole("status")).not.toBeEmpty();
  await expect(page.getByLabel("Tu nombre", { exact: true })).toHaveValue(
    "Contacto de prueba",
  );
  await expect(
    page.getByRole("heading", { name: "Solicitud recibida" }),
  ).toHaveCount(0);
  await form.getByRole("button", { name: "Reintentar envío" }).click();
  await expect(
    form.getByRole("button", { name: "Reintentar envío" }),
  ).toBeEnabled();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  expect(page.url()).not.toContain("prueba@example.com");
});
for (const kind of ["tienda", "restaurante"])
  test(`demo ${kind}: interacción sin pedido real`, async ({ page }) => {
    await page.goto(`/demos/${kind}`);
    await page
      .getByRole("button", { name: /Agregar/ })
      .first()
      .click();
    await expect(page.getByRole("button", { name: /Simular/ })).toBeEnabled();
    if (kind === "tienda")
      await page.getByRole("button", { name: "Pago exacto" }).click();
    await page.getByRole("button", { name: /Simular/ }).click();
    await expect(page.getByRole("status")).toContainText(
      "Simulación completada",
    );
    await expect(
      page.getByRole("link", { name: "Solicitar cotización" }).last(),
    ).toHaveAttribute("href", "/#contacto");
  });
test("veterinaria: búsqueda y estado de cita", async ({ page }) => {
  await page.goto("/demos/veterinaria");
  await page.getByLabel("Buscar mascota").fill("Luna");
  await expect(
    page.getByRole("button", { name: "Registrar llegada" }),
  ).toHaveCount(1);
  for (const name of [
    "Registrar llegada",
    "Iniciar atención",
    "Finalizar atención",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Volver a pendiente" }),
  ).toBeVisible();
});
test("no se entregan datos privados sin sesión", async ({ page, request }) => {
  await page.goto("/admin/solicitudes");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("Veterinaria de ejemplo")).toHaveCount(0);
  const response = await request.get("/admin/solicitudes/ejemplo-vet");
  expect(await response.text()).not.toContain("Cliente de ejemplo");
});
test("escritorio y metadatos para compartir", async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Flores Systems",
  );
  const image = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(image).toBeTruthy();
  const response = await request.get(new URL(image!).pathname);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  await page.screenshot({ path: "test-results/hero-desktop.png" });
});
