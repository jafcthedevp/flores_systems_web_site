import { expect, test } from "@playwright/test";

test("tienda: stock, reposición, vuelto y reinicio", async ({ page }) => {
  await page.goto("/demos/tienda");
  const water = page.getByRole("article", { name: "Agua 625 ml", exact: true });
  await expect(
    water.getByRole("button", { name: "Agregar Agua 625 ml" }),
  ).toBeDisabled();
  await water
    .getByRole("button", { name: "Reponer cinco unidades de Agua 625 ml" })
    .click();
  await expect(water).toContainText("5 unidades disponibles");
  await water.getByRole("button", { name: "Agregar Agua 625 ml" }).click();
  const cart = page.getByRole("complementary", { name: "Caja de prueba" });
  await cart
    .getByRole("button", { name: "Aumentar unidades de Agua 625 ml" })
    .click();
  await cart.getByLabel("Monto recibido (S/)").fill("1");
  await cart.getByRole("button", { name: "Simular venta" }).click();
  await expect(page.getByRole("status")).toContainText("no alcanza");
  await expect(water).toContainText("5 unidades disponibles");
  await cart.getByLabel("Monto recibido (S/)").fill("10");
  await cart.getByRole("button", { name: "Simular venta" }).click();
  await expect(
    page.getByRole("region", { name: "Última venta simulada" }),
  ).toContainText(/Vuelto: S\/\s*5[.,]00/);
  await expect(water).toContainText("3 unidades disponibles");
  await page
    .getByRole("button", { name: "Agregar Aceite 1 L" })
    .click({ clickCount: 3 });
  await expect(
    page.getByRole("button", { name: "Agregar Aceite 1 L" }),
  ).toBeDisabled();
  await cart.getByRole("button", { name: "Pago exacto" }).click();
  await cart.getByRole("button", { name: "Simular venta" }).click();
  await page.getByLabel("Categoría").selectOption("Bebidas");
  await expect(
    page.getByRole("article", { name: "Arroz 1 kg", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(water).toContainText("Agotado");
  await expect(
    page.getByRole("region", { name: "Última venta simulada" }),
  ).toHaveCount(0);
  await expect(page.getByLabel("Categoría")).toHaveValue("Todas");
});

test("restaurante: dos pedidos independientes y seguimiento hasta entrega", async ({
  page,
}) => {
  await page.goto("/demos/restaurante");
  await page.getByRole("button", { name: "Agregar Lomo saltado" }).click();
  await page.getByLabel("Tipo de servicio").selectOption("Para llevar");
  await page
    .getByLabel("Notas del pedido")
    .fill("Sin cebolla; cubiertos para llevar.");
  await page.getByRole("button", { name: "Simular pedido" }).click();
  const first = page.getByRole("article", { name: "Pedido 001", exact: true });
  await expect(first).toContainText("Para llevar");
  await expect(first).toContainText("Sin cebolla; cubiertos para llevar.");
  await page.getByRole("button", { name: "Agregar Limonada" }).click();
  await page.getByLabel("Tipo de servicio").selectOption("En mesa");
  await page.getByRole("combobox", { name: "Mesa", exact: true }).selectOption("Mesa 4");
  await page.getByRole("button", { name: "Simular pedido" }).click();
  const second = page.getByRole("article", { name: "Pedido 002", exact: true });
  await expect(second).toContainText("Mesa 4");
  for (const button of ["Pasar a cocina", "Marcar listo", "Marcar entregado"])
    await first.getByRole("button", { name: button }).click();
  await expect(first).toContainText("Entregado");
  await expect(second).toContainText("Recibido");
  await expect(second).not.toContainText("Sin cebolla");
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(first).toHaveCount(0);
});

test("veterinaria: horarios ocupados, nueva cita, reprogramación y ficha", async ({
  page,
}) => {
  await page.goto("/demos/veterinaria");
  await page.getByLabel("Nombre de la mascota").fill("Nala");
  await page.getByLabel("Responsable de ejemplo").fill("Persona ficticia");
  await page.getByLabel("Hora de la nueva cita").fill("09:30");
  await page.getByRole("button", { name: "Registrar cita" }).click();
  await expect(page.getByRole("status")).toContainText("ya está ocupado");
  await expect(
    page.getByRole("article", { name: "Cita de Nala", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Hora de la nueva cita").fill("12:00");
  await page.getByRole("button", { name: "Registrar cita" }).click();
  const record = page.getByRole("region", {
    name: "Ficha de Nala",
    exact: true,
  });
  await expect(record).toContainText("12:00");
  await record.getByLabel("Nueva hora de la cita").fill("10:15");
  await record.getByRole("button", { name: "Reprogramar cita" }).click();
  await expect(page.getByRole("status")).toContainText("ya está ocupado");
  await expect(
    page.getByRole("article", { name: "Cita de Nala", exact: true }),
  ).toContainText("12:00");
  await record.getByLabel("Nueva hora de la cita").fill("12:30");
  await record.getByRole("button", { name: "Reprogramar cita" }).click();
  await record
    .getByLabel("Nota de prueba")
    .fill("Traer carné a la próxima visita.");
  await record.getByRole("button", { name: "Agregar nota a la ficha" }).click();
  await expect(record.getByRole("listitem")).toHaveText(
    "Traer carné a la próxima visita.",
  );
  await page.getByLabel("Buscar mascota").fill("Nala");
  await page.getByRole("button", { name: "Marcar atendido" }).click();
  await page.getByLabel("Estado de cita").selectOption("Pendientes");
  await expect(
    page.getByRole("article", { name: "Cita de Nala", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Estado de cita").selectOption("Atendidas");
  await expect(
    page.getByRole("article", { name: "Cita de Nala", exact: true }),
  ).toContainText("12:30");
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(record).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(3);
});

for (const kind of ["tienda", "restaurante", "veterinaria"]) {
  test(`${kind}: controles móviles sin desbordamiento ni envíos reales`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors: string[] = [];
    const posts: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto(`/demos/${kind}`);
    if (kind === "veterinaria") {
      await page.getByRole("button", { name: "Ver ficha de Luna" }).click();
      await page.getByLabel("Nota de prueba").fill("Nota móvil de ejemplo.");
      await page
        .getByRole("button", { name: "Agregar nota a la ficha" })
        .click();
    } else {
      await page
        .getByRole("button", { name: /^Agregar / })
        .first()
        .click();
      if (kind === "tienda")
        await page.getByRole("button", { name: "Pago exacto" }).click();
      await page.getByRole("button", { name: /^Simular / }).click();
    }
    await expect(page.getByRole("status")).not.toBeEmpty();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(posts).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `test-results/demo-${kind}-mobile.png`,
      fullPage: true,
    });
  });
}
