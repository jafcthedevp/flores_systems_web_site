import { expect, test } from "@playwright/test";
import { openModule } from "./demo-navigation";

for (const width of [1440, 390]) {
  test(`tienda ${width}: inventario, venta y devolución entre módulos`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos/tienda");
    await openModule(page, "Inventario");
    const water = page.getByRole("row", { name: /Agua 625 ml/ });
    await expect(water).toContainText("Agotado");
    await water
      .getByRole("button", { name: "Reponer cinco unidades de Agua 625 ml" })
      .click();
    await expect(water).toContainText("5 unidades disponibles");
    await openModule(page, "Punto de venta");
    await page
      .getByRole("button", { name: "Agregar Agua 625 ml", exact: true })
      .click();
    await expect(page.locator(".demo-cart")).toHaveCount(0);
    await page.getByRole("button", { name: "Ir a caja", exact: true }).click();
    await page
      .getByRole("button", {
        name: "Aumentar unidades de Agua 625 ml",
        exact: true,
      })
      .click();
    await page.getByLabel("Monto recibido (S/)").fill("1");
    await page
      .getByRole("button", { name: "Simular venta", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("no alcanza");
    await page.getByLabel("Monto recibido (S/)").fill("10");
    await page
      .getByRole("button", { name: "Simular venta", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Última venta simulada" }),
    ).toContainText(/Vuelto: S\/\s*5[.,]00/);
    await openModule(page, "Inventario");
    await expect(water).toContainText("3 unidades disponibles");
    await openModule(page, "Ventas y devoluciones");
    await page
      .getByRole("button", {
        name: "Devolver 1 unidad de Agua 625 ml",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText("regresaron al stock");
    await openModule(page, "Inventario");
    await expect(water).toContainText("4 unidades disponibles");
    await page
      .getByRole("button", { name: "Reiniciar demo", exact: true })
      .click();
    await expect(water).toContainText("Agotado");
    await openModule(page, "Resumen");
    await expect(
      page.getByRole("group", { name: "Ventas realizadas", exact: true }),
    ).toContainText("0");
  });

  test(`tienda ${width}: descuento, vuelto y reposición opcional`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos/tienda");
    await openModule(page, "Punto de venta");
    await page
      .getByRole("button", { name: "Agregar Arroz 1 kg", exact: true })
      .click({ clickCount: 2 });
    await page.getByRole("button", { name: "Ir a caja", exact: true }).click();
    await page.getByLabel("Descuento de la venta").selectOption("10");
    await expect(page.locator(".demo-cart .demo-total")).toContainText(/9\.90/);
    await page.getByLabel("Monto recibido (S/)").fill("10");
    await page
      .getByRole("button", { name: "Simular venta", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Última venta simulada" }),
    ).toContainText(/0\.10/);
    await openModule(page, "Ventas y devoluciones");
    const form = page.getByRole("form", {
      name: "Devolver Arroz 1 kg",
      exact: true,
    });
    await expect(form).toContainText(/4\.95/);
    await form
      .getByRole("button", {
        name: "Devolver 1 unidad de Arroz 1 kg",
        exact: true,
      })
      .click();
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
    await expect(page.locator(".demo-sale-summary")).toContainText(
      /Neto: S\/\s*0\.00/,
    );
    await openModule(page, "Inventario");
    await expect(page.getByRole("row", { name: /Arroz 1 kg/ })).toContainText(
      "23 unidades disponibles",
    );
  });

  test(`restaurante ${width}: mesas, variantes y cocina conservan el pedido`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos/restaurante");
    await openModule(page, "Mesas y servicio");
    await page
      .getByRole("button", { name: "Preparar pedido para Mesa 4", exact: true })
      .click();
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
      .getByRole("button", { name: "Agregar Lomo saltado", exact: true })
      .click();
    await dish
      .getByRole("combobox", {
        name: "Preparación de Lomo saltado",
        exact: true,
      })
      .selectOption("original");
    await dish
      .getByRole("combobox", { name: "Adicional de Lomo saltado", exact: true })
      .selectOption("huevo");
    await dish
      .getByRole("button", { name: "Agregar Lomo saltado", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Revisar pedido", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Mesa", exact: true }),
    ).toHaveValue("Mesa 4");
    await expect(page.locator(".cart-line")).toHaveCount(2);
    await page.getByLabel("Notas del pedido").fill("Cubiertos para compartir.");
    await page
      .getByRole("button", { name: "Simular pedido", exact: true })
      .click();
    await openModule(page, "Cocina");
    const order = page.getByRole("article", {
      name: "Pedido 001",
      exact: true,
    });
    await expect(order).toContainText("Mesa 4");
    await expect(order).toContainText("Sin cebolla");
    await expect(order).toContainText("Huevo frito");
    await expect(order).toContainText("Cubiertos para compartir");
    for (const name of ["Pasar a cocina", "Marcar listo", "Marcar entregado"])
      await order.getByRole("button", { name, exact: true }).click();
    await expect(order).toContainText("Entregado");
    await openModule(page, "Mesas y servicio");
    await expect(
      page.getByRole("button", {
        name: "Preparar pedido para Mesa 4",
        exact: true,
      }),
    ).toContainText("Disponible");
  });

  test(`restaurante ${width}: pedidos independientes y para llevar`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos/restaurante");
    for (const dish of ["Lomo saltado", "Limonada"]) {
      await openModule(page, "Carta");
      await page
        .getByRole("button", { name: `Agregar ${dish}`, exact: true })
        .click();
      await page
        .getByRole("button", { name: "Revisar pedido", exact: true })
        .click();
      if (dish === "Lomo saltado") {
        await page.getByLabel("Tipo de servicio").selectOption("Para llevar");
        await page.getByLabel("Notas del pedido").fill("Sin cubiertos.");
      } else {
        await page.getByLabel("Tipo de servicio").selectOption("En mesa");
      }
      await page
        .getByRole("button", { name: "Simular pedido", exact: true })
        .click();
    }
    await openModule(page, "Cocina");
    const first = page.getByRole("article", {
      name: "Pedido 001",
      exact: true,
    });
    const second = page.getByRole("article", {
      name: "Pedido 002",
      exact: true,
    });
    await expect(first).toContainText("Para llevar");
    await expect(first).toContainText("Sin cubiertos");
    await expect(second).not.toContainText("Sin cubiertos");
    await first
      .getByRole("button", { name: "Pasar a cocina", exact: true })
      .click();
    await expect(second).toContainText("Recibido");
    await page
      .getByRole("button", { name: "Reiniciar demo", exact: true })
      .click();
    await expect(first).toHaveCount(0);
  });

  test(`veterinaria ${width}: cita, agenda y ficha independientes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demos/veterinaria");
    await openModule(page, "Nueva cita");
    await page.getByLabel("Nombre de la mascota").fill("Nala");
    await page.getByLabel("Responsable de ejemplo").fill("Persona ficticia");
    await page.getByLabel("Hora de la nueva cita").fill("09:30");
    await page
      .getByRole("button", { name: "Registrar cita", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("ya está ocupado");
    await page.getByLabel("Hora de la nueva cita").fill("12:00");
    await page
      .getByRole("button", { name: "Registrar cita", exact: true })
      .click();
    await expect(
      page.getByRole("article", { name: "Cita de Nala", exact: true }),
    ).toContainText("12:00");
    await page
      .getByRole("button", { name: "Ver ficha de Nala", exact: true })
      .click();
    const record = page.getByRole("region", {
      name: "Ficha de Nala",
      exact: true,
    });
    await record.getByLabel("Nueva hora de la cita").fill("10:15");
    await record
      .getByRole("button", { name: "Reprogramar cita", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("ya está ocupado");
    await record.getByLabel("Nueva hora de la cita").fill("12:30");
    await record
      .getByRole("button", { name: "Reprogramar cita", exact: true })
      .click();
    await record
      .getByLabel("Nota de prueba")
      .fill("Traer carné a la próxima visita.");
    await record
      .getByRole("button", { name: "Agregar nota a la ficha", exact: true })
      .click();
    await expect(record.getByRole("listitem")).toHaveText(
      "Traer carné a la próxima visita.",
    );
    await openModule(page, "Agenda");
    await page.getByLabel("Buscar mascota", { exact: true }).fill("Nala");
    for (const name of [
      "Registrar llegada",
      "Iniciar atención",
      "Finalizar atención",
    ])
      await page.getByRole("button", { name, exact: true }).click();
    await page.getByLabel("Estado de cita").selectOption("Atendidas");
    await expect(
      page.getByRole("article", { name: "Cita de Nala", exact: true }),
    ).toContainText("12:30");
    await openModule(page, "Pacientes");
    await page
      .getByRole("button", { name: "Ver ficha de Nala", exact: true })
      .click();
    await expect(record.getByRole("listitem")).toHaveText(
      "Traer carné a la próxima visita.",
    );
  });

  test(`veterinaria ${width}: seguimiento por paciente y sin envíos reales`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") posts.push(request.url());
    });
    await page.goto("/demos/veterinaria");
    await openModule(page, "Seguimiento");
    await page.getByLabel("Paciente para seguimiento").selectOption("1");
    const followup = page.getByRole("region", {
      name: "Recordatorios de Luna",
      exact: true,
    });
    await followup.getByLabel("Fecha del recordatorio").fill("2026-11-10");
    await followup
      .getByRole("button", { name: "Crear recordatorio", exact: true })
      .click();
    await followup.getByLabel("Fecha del recordatorio").fill("2026-11-10");
    await followup
      .getByRole("button", { name: "Crear recordatorio", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Ya existe ese recordatorio",
    );
    await followup.getByText("Ver mensaje de prueba", { exact: true }).click();
    await expect(followup.locator(".demo-message-preview")).toContainText(
      "Luna para el 10 de noviembre",
    );
    await followup
      .getByRole("button", { name: "Simular envío", exact: true })
      .click();
    await expect(
      followup.getByRole("button", { name: "Simular envío", exact: true }),
    ).toBeDisabled();
    await page.getByLabel("Paciente para seguimiento").selectOption("2");
    await expect(
      page
        .getByRole("region", { name: "Recordatorios de Toby", exact: true })
        .getByRole("article"),
    ).toHaveCount(0);
    await openModule(page, "Pacientes");
    await page
      .getByRole("button", { name: "Ver ficha de Luna", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Abrir seguimiento de Luna", exact: true })
      .click();
    await expect(followup.getByRole("article")).toHaveCount(1);
    expect(posts).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
