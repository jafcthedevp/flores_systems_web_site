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
  await page
    .getByRole("combobox", { name: "Mesa", exact: true })
    .selectOption("Mesa 4");
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
  for (const name of [
    "Registrar llegada",
    "Iniciar atención",
    "Finalizar atención",
  ])
    await page.getByRole("button", { name, exact: true }).click();
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

for (const width of [1440, 390]) {
  test(`tienda ${width}: descuento, devolución parcial y reposición opcional`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto("/demos/tienda");
    const rice = page.getByRole("article", { name: "Arroz 1 kg", exact: true });
    await rice
      .getByRole("button", { name: "Agregar Arroz 1 kg", exact: true })
      .click();
    const cart = page.getByRole("complementary", { name: "Caja de prueba" });
    await cart
      .getByRole("button", {
        name: "Aumentar unidades de Arroz 1 kg",
        exact: true,
      })
      .click();
    await cart
      .getByRole("combobox", { name: "Descuento de la venta", exact: true })
      .selectOption("10");
    await expect(cart.locator(".demo-total")).toContainText(/9\.90/);
    await cart.getByLabel("Monto recibido (S/)").fill("10");
    await cart
      .getByRole("button", { name: "Simular venta", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Última venta simulada" }),
    ).toContainText(/Vuelto: S\/\s*0\.10/);
    await expect(rice).toContainText("22 unidades disponibles");
    // A second sale must not inherit the first sale's discount.
    await page
      .getByRole("button", { name: "Agregar Leche 400 g", exact: true })
      .click();
    await expect(
      cart.getByRole("combobox", {
        name: "Descuento de la venta",
        exact: true,
      }),
    ).toHaveValue("0");
    await cart
      .getByRole("combobox", { name: "Medio de pago", exact: true })
      .selectOption("Yape simulado");
    await cart
      .getByRole("button", { name: "Simular venta", exact: true })
      .click();
    const history = page.getByRole("region", {
      name: "Ventas y devoluciones de prueba",
      exact: true,
    });
    await history
      .getByRole("combobox", { name: "Venta a consultar", exact: true })
      .selectOption("1");
    const form = history.getByRole("form", {
      name: "Devolver Arroz 1 kg",
      exact: true,
    });
    await expect(form).toContainText(/Reembolso simulado: S\/\s*4\.95/);
    await form
      .getByRole("button", {
        name: "Devolver 1 unidad de Arroz 1 kg",
        exact: true,
      })
      .click();
    await expect(rice).toContainText("23 unidades disponibles");
    await form
      .getByRole("checkbox", {
        name: "Reincorporar Arroz 1 kg al stock",
        exact: true,
      })
      .uncheck();
    await form
      .getByRole("button", {
        name: "Devolver 1 unidad de Arroz 1 kg",
        exact: true,
      })
      .click();
    await expect(rice).toContainText("23 unidades disponibles");
    await expect(form.getByRole("button")).toHaveCount(0);
    await expect(history.locator(".demo-sale-summary")).toContainText(
      /Devuelto: S\/\s*9\.90/,
    );
    await expect(history.locator(".demo-sale-summary")).toContainText(
      /Neto: S\/\s*0\.00/,
    );
    await expect(page.locator(".demo-receipt .demo-total")).toContainText(
      /4\.20/,
    );
    await history.screenshot({
      path: `test-results/demo-devoluciones-${width}.png`,
      animations: "disabled",
      style: ".site-header { visibility: hidden; }",
    });
    await history
      .getByRole("combobox", { name: "Venta a consultar", exact: true })
      .selectOption("2");
    await expect(history.locator(".demo-sale-summary")).toContainText(
      /Devuelto: S\/\s*0\.00/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(posts).toEqual([]);
    await page
      .getByRole("button", { name: "Reiniciar demo", exact: true })
      .click();
    await expect(history).toHaveCount(0);
    await expect(rice).toContainText("24 unidades disponibles");
  });

  test(`restaurante ${width}: variantes del mismo plato llegan separadas a cocina`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos/restaurante");
    const dish = page.getByRole("article", {
      name: "Lomo saltado",
      exact: true,
    });
    await dish.getByText("Personalizar Lomo saltado", { exact: true }).click();
    await dish
      .getByRole("combobox", {
        name: "Preparación de Lomo saltado",
        exact: true,
      })
      .selectOption("sin-cebolla");
    await dish
      .getByRole("combobox", { name: "Adicional de Lomo saltado", exact: true })
      .selectOption("huevo");
    await dish
      .getByRole("button", { name: "Agregar Lomo saltado", exact: true })
      .click();
    const cart = page.getByRole("complementary", { name: "Pedido de prueba" });
    await cart
      .getByRole("button", {
        name: "Aumentar unidades de Lomo saltado, Sin cebolla, Huevo frito",
        exact: true,
      })
      .click();
    await dish
      .getByRole("combobox", {
        name: "Preparación de Lomo saltado",
        exact: true,
      })
      .selectOption("original");
    await dish
      .getByRole("combobox", { name: "Adicional de Lomo saltado", exact: true })
      .selectOption("ninguno");
    await dish
      .getByRole("button", { name: "Agregar Lomo saltado", exact: true })
      .click();
    await expect(cart.locator(".cart-line")).toHaveCount(2);
    await expect(cart.locator(".demo-total")).toContainText(/91\.00/);
    await page
      .getByRole("button", { name: "Simular pedido", exact: true })
      .click();
    const order = page.getByRole("article", {
      name: "Pedido 001",
      exact: true,
    });
    await expect(order.locator(".demo-kitchen-line")).toHaveCount(2);
    await expect(order.locator(".demo-kitchen-line").first()).toContainText(
      "2 × Lomo saltado",
    );
    await expect(order.locator(".demo-kitchen-line").first()).toContainText(
      "Sin cebolla · Huevo frito",
    );
    await expect(order.locator(".demo-kitchen-line").last()).not.toContainText(
      "Huevo frito",
    );
    await order
      .getByRole("button", { name: "Pasar a cocina", exact: true })
      .click();
    await expect(order).toContainText("En cocina");
    await expect(order).toContainText("Sin cebolla · Huevo frito");
    await expect(order).toHaveCSS("opacity", "1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await order.screenshot({
      path: `test-results/demo-modificadores-${width}.png`,
      animations: "disabled",
      style: ".site-header { visibility: hidden; }",
    });
  });

  test(`veterinaria ${width}: atención completa y recordatorios vinculados a una mascota`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto("/demos/veterinaria");
    const appointment = page.getByRole("article", {
      name: "Cita de Luna",
      exact: true,
    });
    await appointment
      .getByRole("button", { name: "Ver ficha de Luna", exact: true })
      .click();
    const record = page.getByRole("region", {
      name: "Ficha de Luna",
      exact: true,
    });
    await appointment
      .getByRole("button", { name: "Registrar llegada", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Estado de cita", exact: true })
      .selectOption("En espera");
    await expect(appointment).toBeVisible();
    await appointment
      .getByRole("button", { name: "Iniciar atención", exact: true })
      .click();
    await expect(appointment).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Estado de cita", exact: true })
      .selectOption("En atención");
    await appointment
      .getByRole("button", { name: "Finalizar atención", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Estado de cita", exact: true })
      .selectOption("Atendidas");
    await expect(appointment).toContainText("Finalizada");
    await expect(record.locator('[aria-current="step"]')).toHaveText(
      "Finalizada",
    );
    const followup = record.getByRole("region", {
      name: "Recordatorios de Luna",
      exact: true,
    });
    await followup
      .getByRole("combobox", { name: "Motivo del recordatorio", exact: true })
      .selectOption("Vacunación");
    await followup
      .getByLabel("Fecha del recordatorio", { exact: true })
      .fill("2026-11-10");
    await followup
      .getByRole("combobox", { name: "Canal de prueba", exact: true })
      .selectOption("WhatsApp de prueba");
    await followup
      .getByRole("button", { name: "Crear recordatorio", exact: true })
      .click();
    await followup
      .getByLabel("Fecha del recordatorio", { exact: true })
      .fill("2026-11-10");
    await followup
      .getByRole("button", { name: "Crear recordatorio", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Ya existe ese recordatorio",
    );
    await expect(followup.getByRole("article")).toHaveCount(1);
    await followup.getByText("Ver mensaje de prueba", { exact: true }).click();
    await expect(followup.locator(".demo-message-preview")).toContainText(
      "Cliente de ejemplo A",
    );
    await expect(followup.locator(".demo-message-preview")).toContainText(
      "Luna para el 10 de noviembre",
    );
    await followup
      .getByRole("button", { name: "Simular envío", exact: true })
      .click();
    await expect(
      followup.getByRole("button", { name: "Simular envío", exact: true }),
    ).toBeDisabled();
    await expect(page.getByRole("status")).toContainText(
      "No se envió ningún mensaje real",
    );
    await followup.screenshot({
      path: `test-results/demo-recordatorios-${width}.png`,
      animations: "disabled",
      style: ".site-header { visibility: hidden; }",
    });
    await page
      .getByRole("combobox", { name: "Estado de cita", exact: true })
      .selectOption("Todas");
    await page
      .getByRole("button", { name: "Ver ficha de Toby", exact: true })
      .click();
    await expect(
      page
        .getByRole("region", { name: "Recordatorios de Toby", exact: true })
        .getByRole("article"),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Ver ficha de Luna", exact: true })
      .click();
    await expect(followup.getByRole("article")).toHaveCount(1);
    await record
      .getByLabel("Nueva hora de la cita", { exact: true })
      .fill("14:00");
    await record
      .getByRole("button", { name: "Reprogramar cita", exact: true })
      .click();
    await expect(appointment).toContainText("Pendiente");
    await expect(record.locator('[aria-current="step"]')).toHaveText(
      "Pendiente",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(posts).toEqual([]);
    await page
      .getByRole("button", { name: "Reiniciar demo", exact: true })
      .click();
    await expect(record).toHaveCount(0);
  });
}
