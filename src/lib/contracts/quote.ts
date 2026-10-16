import { z } from "zod";
import {
  quoteSchema as backendQuoteSchema,
  PRIVACY_VERSION,
} from "./quote-requests";
export const businessTypes = {
  veterinaria: "Veterinaria",
  restaurante: "Restaurante",
  tienda_bodega: "Tienda o bodega",
  mercado_puesto: "Mercado o puesto",
  spa: "Spa",
  colegio: "Colegio",
  ropa: "Tienda de ropa",
  otro: "Otro",
} as const;
export const services = {
  sitio_web: "Sitio web",
  sistema_administrativo: "Sistema administrativo",
  ambos: "Ambos",
  orientacion: "Necesito orientación",
} as const;
export const statuses = {
  nuevo: "Nuevo",
  en_conversacion: "En conversación",
  cotizado: "Cotizado",
  cerrado: "Cerrado",
} as const;
export const outcomes = {
  ganado: "Ganado",
  perdido: "Perdido",
  desistido: "Desistido",
} as const;
export const origins = {
  formulario_web: "Formulario web",
  whatsapp: "WhatsApp",
  correo: "Correo",
  prospeccion: "Prospección",
  otro: "Otro",
} as const;
export const budgets = {
  por_definir: "Aún no lo sé",
  menos_1000: "Menos de S/ 1.000",
  "1000_3000": "S/ 1.000 a S/ 3.000",
  "3000_6000": "S/ 3.000 a S/ 6.000",
  mas_6000: "Más de S/ 6.000",
} as const;
export const timeframes = {
  por_definir: "Aún no lo sé",
  urgente: "Lo antes posible",
  "1_3_meses": "En uno a tres meses",
  "3_6_meses": "En tres a seis meses",
} as const;
export const privacyVersion = PRIVACY_VERSION;
export const backendFields: Record<string, string> = {
  contact_name: "name",
  business_name: "business",
  business_type: "businessType",
  preferred_channel: "channel",
  timeframe: "timeline",
};
export function toBackend(data: Record<string, unknown>, key: string) {
  return {
    contact_name: data.name,
    business_name: data.business,
    business_type: data.businessType,
    service: data.service,
    description: data.description,
    preferred_channel: data.channel,
    email: data.email || null,
    phone: data.phone || null,
    budget: data.budget || null,
    timeframe: data.timeline || null,
    consent: data.consent,
    idempotency_key: key,
    website: data.website ?? "",
  };
}
// Una sola fuente de reglas: el contrato BE-1. La interfaz traduce los nombres
// de campo para mantener sus componentes independientes del almacenamiento.
export const quoteSchema = z
  .preprocess(
    (input) =>
      toBackend(
        (input || {}) as Record<string, unknown>,
        "00000000-0000-0000-0000-000000000000",
      ),
    backendQuoteSchema,
  )
  .transform((data) => ({
    name: data.contact_name,
    business: data.business_name,
    businessType: data.business_type,
    service: data.service,
    description: data.description,
    channel: data.preferred_channel,
    email: data.email || "",
    phone: data.phone || "",
    budget: data.budget || "",
    timeline: data.timeframe || "",
    consent: data.consent,
  } as const));
export type Quote = z.infer<typeof quoteSchema>;
export type QuoteErrors = Partial<Record<keyof Quote, string>>;
export type QuoteResult =
  | { status: "success"; reference: string }
  | { status: "invalid"; errors: QuoteErrors }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "temporary" | "conflict"; message: string };
export type SubmitQuote = (
  data: Quote,
  idempotencyKey: string,
) => Promise<QuoteResult>;
export function fieldErrors(error: z.ZodError): QuoteErrors {
  return Object.fromEntries(
    error.issues.map((issue) => {
      const key = String(issue.path[0]);
      const name = backendFields[key] || key;
      let message = issue.message;
      if (issue.code === "too_small")
        message =
          issue.minimum === 1
            ? "Completa este campo."
            : `Escribe al menos ${issue.minimum} caracteres.`;
      if (issue.code === "too_big")
        message = `Usa como máximo ${issue.maximum} caracteres.`;
      if (issue.code === "invalid_format" && name === "email")
        message = "Escribe un correo válido.";
      if (issue.code === "invalid_format" && name === "phone")
        message = "Incluye el código de país, por ejemplo +51 986 132 628.";
      if (
        issue.code === "invalid_value" &&
        ["businessType", "service", "channel", "budget", "timeline"].includes(
          name,
        )
      )
        message = "Selecciona una opción de la lista.";
      return [name, message];
    }),
  );
}
