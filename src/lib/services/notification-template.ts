import type { QuoteInput } from '@/lib/contracts/quote-requests';
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
export function notificationPayload(input: QuoteInput, from: string, to: string, details: { reference: string; dashboardUrl: string }) {
  // Se persiste el contenido completo: los reintentos envían exactamente el mismo correo.
  return {
    from, to: [to], subject: 'Nueva solicitud — Flores Systems',
    html: `<h1>Nueva solicitud</h1><p>Referencia: ${escapeHtml(details.reference)}</p><p>${escapeHtml(input.contact_name)} · ${escapeHtml(input.business_name)}</p><p>${escapeHtml(input.business_type)} · ${escapeHtml(input.service)}</p><p>Contacto preferido: ${input.preferred_channel}</p><p>${escapeHtml(input.email ?? input.phone ?? '')}</p><p>${escapeHtml(input.description)}</p><p><a href="${escapeHtml(details.dashboardUrl)}">Ver solicitud en el panel privado</a></p>`,
  };
}
