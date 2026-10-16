import { describe, expect, it } from "vitest";
import { quoteSchema } from "../src/lib/contracts/quote";
const valid = {
  name: "  Ana  ",
  business: "Negocio de ejemplo",
  businessType: "veterinaria",
  service: "ambos",
  description: "Quiero organizar las citas de mi negocio.",
  channel: "correo",
  email: "ana@example.com",
  phone: "",
  budget: "",
  timeline: "",
  consent: true,
};
describe("contrato del formulario público", () => {
  it("acepta y normaliza un contacto por correo", () => {
    const parsed = quoteSchema.parse(valid);
    expect(parsed.name).toBe("Ana");
  });
  it("exige el correo si se elige ese canal aunque exista teléfono", () => {
    expect(
      quoteSchema.safeParse({ ...valid, email: "", phone: "+51986132628" })
        .success,
    ).toBe(false);
  });
  it("exige teléfono internacional para WhatsApp", () => {
    expect(
      quoteSchema.safeParse({
        ...valid,
        channel: "whatsapp",
        email: "",
        phone: "986132628",
      }).success,
    ).toBe(false);
  });
  it("normaliza separadores del teléfono", () => {
    expect(
      quoteSchema.parse({
        ...valid,
        channel: "whatsapp",
        phone: "+51 (986) 132-628",
      }).phone,
    ).toBe("+51986132628");
  });
  it("rechaza catálogos manipulados y textos demasiado largos", () => {
    expect(
      quoteSchema.safeParse({ ...valid, businessType: "admin" }).success,
    ).toBe(false);
    expect(
      quoteSchema.safeParse({ ...valid, name: "a".repeat(81) }).success,
    ).toBe(false);
    expect(
      quoteSchema.safeParse({ ...valid, description: "a".repeat(2001) })
        .success,
    ).toBe(false);
  });
  it("requiere autorización expresa", () => {
    expect(quoteSchema.safeParse({ ...valid, consent: false }).success).toBe(
      false,
    );
  });
  it("rechaza un dato de contacto opcional mal formado", () => {
    expect(
      quoteSchema.safeParse({ ...valid, phone: "incorrecto" }).success,
    ).toBe(false);
  });
});
