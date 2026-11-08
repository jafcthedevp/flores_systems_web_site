import { expect, test } from "@playwright/test";
import { openModule } from "./demo-navigation";
test("el fondo se anima automáticamente al entrar y al regresar a la portada", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const video = page.locator("#inicio video");
  await expect(video).toHaveJSProperty("paused", false);
  const firstFrame = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime,
  );
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(firstFrame + 0.2);
  await expect(page.locator("#inicio button")).toHaveCount(0);
  await expect(video).toHaveJSProperty("controls", false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(video).toHaveJSProperty("paused", false);
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", true);
  await page.locator("#inicio").scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
});
test("el video vuelve al inicio y sigue avanzando al completar el bucle", async ({
  page,
}) => {
  await page.goto("/");
  const video = page.locator("#inicio video");
  await expect(video.locator("source")).toHaveAttribute(
    "src",
    "/agentic/hero-loop.mp4",
  );
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = element.duration - 0.3;
  });
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeLessThan(1);
  await expect(video).toHaveJSProperty("paused", false);
  const afterWrap = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime,
  );
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(afterWrap + 0.2);
  await expect(video).toHaveJSProperty("videoWidth", 1920);
  await expect(video).toHaveJSProperty("videoHeight", 1080);
});
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
  await expect(page.locator("#inicio video")).toHaveJSProperty("paused", false);
  const poster = await page.locator("#inicio video").getAttribute("poster");
  expect(poster).toBe("/agentic/hero-poster.jpg");
  expect((await page.request.get(poster!)).ok()).toBe(true);
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
    await openModule(page, kind === "tienda" ? "Punto de venta" : "Carta");
    await page
      .getByRole("button", { name: /Agregar/ })
      .first()
      .click();
    await page
      .getByRole("button", {
        name: kind === "tienda" ? "Ir a caja" : "Revisar pedido",
        exact: true,
      })
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
  await openModule(page, "Agenda");
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
