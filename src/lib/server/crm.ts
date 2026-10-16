import "server-only";
import { notFound } from "next/navigation";
import type { Quote } from "@/lib/contracts/quote";
import type { statuses, origins } from "@/lib/contracts/quote";
export type Lead = Quote & {
  id: string;
  createdAt: string;
  status: keyof typeof statuses;
  origin: keyof typeof origins;
  followUp: string;
  notification: "pendiente" | "fallido" | "aceptado" | "entregado";
};
export function isPreview() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.FRONTEND_PREVIEW === "true"
  );
}
export function requirePreview() {
  if (!isPreview()) notFound();
}
// Datos exclusivamente ficticios. BE-3 sustituirá esta capa por consultas
// autorizadas en cada lectura y mutación; nunca se usa como autenticación.
export const sampleLeads: Lead[] = [
  {
    id: "ejemplo-vet",
    name: "Contacto de ejemplo A",
    business: "Veterinaria de ejemplo",
    businessType: "veterinaria",
    service: "ambos",
    description:
      "Necesitamos organizar las citas y mostrar nuestros servicios.",
    channel: "whatsapp",
    phone: "+51900000001",
    email: "",
    budget: "",
    timeline: "",
    consent: true,
    createdAt: "2026-10-15T14:30:00Z",
    status: "nuevo",
    origin: "formulario_web",
    followUp: "2026-10-16T15:00:00Z",
    notification: "fallido",
  },
  {
    id: "ejemplo-restaurante",
    name: "Contacto de ejemplo B",
    business: "Restaurante de ejemplo",
    businessType: "restaurante",
    service: "sitio_web",
    description:
      "Queremos una carta digital fácil de consultar desde el celular.",
    channel: "correo",
    phone: "",
    email: "ejemplo@example.com",
    budget: "por_definir",
    timeline: "1_3_meses",
    consent: true,
    createdAt: "2026-10-14T18:00:00Z",
    status: "en_conversacion",
    origin: "prospeccion",
    followUp: "2026-10-15T19:00:00Z",
    notification: "aceptado",
  },
  {
    id: "ejemplo-bodega",
    name: "Contacto de ejemplo C",
    business: "Bodega de ejemplo",
    businessType: "tienda_bodega",
    service: "sistema_administrativo",
    description: "Buscamos un control de productos y ventas para el negocio.",
    channel: "correo",
    phone: "",
    email: "bodega@example.com",
    budget: "",
    timeline: "",
    consent: true,
    createdAt: "2026-10-12T15:00:00Z",
    status: "cotizado",
    origin: "whatsapp",
    followUp: "",
    notification: "entregado",
  },
];
export type LeadFilters = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
  pending?: string;
};
export async function listLeads(filters: LeadFilters) {
  requirePreview();
  const q = (filters.q || "").trim().toLocaleLowerCase("es");
  const filtered = sampleLeads
    .filter((lead) => {
      const day = limaDay(lead.createdAt);
      return (
        (!q ||
          [lead.name, lead.business, lead.email, lead.phone].some((value) =>
            value.toLocaleLowerCase("es").includes(q),
          )) &&
        (!filters.status || lead.status === filters.status) &&
        (!filters.from || day >= filters.from) &&
        (!filters.to || day <= filters.to) &&
        (!filters.pending || (lead.status !== "cerrado" && !!lead.followUp))
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pageSize = 2;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(filters.page || "1", 10) || 1),
  );
  return {
    rows: filtered.slice((page - 1) * pageSize, page * pageSize),
    count: filtered.length,
    page,
    pages,
  };
}
export function limaDay(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
export function limaDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
