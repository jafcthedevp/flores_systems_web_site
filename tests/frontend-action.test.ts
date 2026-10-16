import { describe, expect, it, vi, beforeEach } from "vitest";
vi.mock("../src/app/actions/quote-requests", () => ({
  submitQuoteRequest: vi.fn(),
}));
import { submitQuoteRequest } from "../src/app/actions/quote-requests";
import { submitQuote } from "../src/app/actions/quote";
const backend = vi.mocked(submitQuoteRequest);
const key = "32c881a8-534d-4de1-af07-4e3427e64db5";
const valid = {
  name: "Ana",
  business: "Negocio ficticio",
  businessType: "tienda_bodega",
  service: "ambos",
  description: "Necesito organizar los productos de mi negocio.",
  channel: "correo",
  email: "ana@example.com",
  phone: "",
  budget: "por_definir",
  timeline: "1_3_meses",
  consent: true,
};
beforeEach(() => backend.mockReset());
describe("adaptador frontend a BE-1", () => {
  it("solo confirma cuando BE-1 devuelve guardado y referencia", async () => {
    backend.mockResolvedValue({ ok: true, reference: "FS-EJEMPLO" });
    expect(await submitQuote(valid, key)).toEqual({
      status: "success",
      reference: "FS-EJEMPLO",
    });
    const form = backend.mock.calls[0][1];
    expect(form.get("idempotency_key")).toBe(key);
    expect(form.get("business_type")).toBe("tienda_bodega");
    expect(form.get("consent")).toBe("on");
  });
  it("reutiliza la misma clave al reintentar el mismo envío", async () => {
    backend.mockResolvedValue({ ok: false, code: "unavailable" });
    expect((await submitQuote(valid, key)).status).toBe("temporary");
    expect((await submitQuote(valid, key)).status).toBe("temporary");
    expect(
      backend.mock.calls.map((call) => call[1].get("idempotency_key")),
    ).toEqual([key, key]);
  });
  it("traduce límite de envíos y conflicto sin mostrar éxito", async () => {
    backend.mockResolvedValueOnce({
      ok: false,
      code: "rate_limited",
      retryAfter: 120,
    });
    expect(await submitQuote(valid, key)).toEqual({
      status: "rate_limited",
      retryAfterSeconds: 120,
    });
    backend.mockResolvedValueOnce({ ok: false, code: "conflict" });
    expect((await submitQuote(valid, key)).status).toBe("conflict");
  });
  it("mapea los errores del backend al campo visible", async () => {
    backend.mockResolvedValue({
      ok: false,
      code: "invalid",
      errors: { contact_name: ["Revisa el nombre."] },
    });
    expect(await submitQuote(valid, key)).toEqual({
      status: "invalid",
      errors: { name: "Revisa el nombre." },
    });
  });
  it("no llama al backend con datos inválidos o clave inválida", async () => {
    expect((await submitQuote({ ...valid, consent: false }, key)).status).toBe(
      "invalid",
    );
    expect((await submitQuote(valid, "invalida")).status).toBe("temporary");
    expect(backend).not.toHaveBeenCalled();
  });
});
