import { expect, type Page } from "@playwright/test";
export async function openModule(page: Page, name: string) {
  const button = page
    .getByRole("navigation", { name: "Módulos de la demo" })
    .getByRole("button", { name, exact: true });
  if (
    await page
      .getByRole("button", { name: "Abrir menú del sistema", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Abrir menú del sistema", exact: true })
      .click();
  await button.click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: name === "Resumen" ? "Vista general" : name,
      exact: true,
    }),
  ).toBeVisible();
}
