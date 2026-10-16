"use server";
import {
  backendFields,
  fieldErrors,
  quoteSchema,
  toBackend,
  type QuoteResult,
} from "@/lib/contracts/quote";
import { submitQuoteRequest } from "./quote-requests";
import { z } from "zod";
// Adaptador del frontend a BE-1. Solo devolver éxito tras confirmación real.
export async function submitQuote(
  data: unknown,
  idempotencyKey: string,
): Promise<QuoteResult> {
  const parsed = quoteSchema.safeParse(data);
  if (!parsed.success)
    return { status: "invalid", errors: fieldErrors(parsed.error) };
  if (!z.uuid().safeParse(idempotencyKey).success)
    return {
      status: "temporary",
      message:
        "No se pudo preparar el envío. Recarga la página e inténtalo de nuevo.",
    };
  const payload = toBackend(parsed.data, idempotencyKey);
  const form = new FormData();
  for (const [key, value] of Object.entries(payload))
    if (value !== null && value !== undefined)
      form.set(key, key === "consent" ? "on" : String(value));
  const result = await submitQuoteRequest(null, form);
  if (result.ok) return { status: "success", reference: result.reference };
  if (result.code === "invalid")
    return {
      status: "invalid",
      errors: Object.fromEntries(
        Object.entries(result.errors || {}).map(([key, messages]) => [
          backendFields[key] || key,
          messages[0],
        ]),
      ),
    };
  if (result.code === "rate_limited")
    return {
      status: "rate_limited",
      retryAfterSeconds: result.retryAfter || 60,
    };
  if (result.code === "conflict")
    return {
      status: "conflict",
      message:
        "Este envío ya se recibió con otros datos. Revisa lo escrito o comienza una nueva solicitud.",
    };
  return {
    status: "temporary",
    message:
      "No pudimos confirmar el guardado. Tus datos siguen aquí; reintenta o escríbenos por WhatsApp.",
  };
}
