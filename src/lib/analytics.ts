export type AnalyticsEvent =
  "visit" | "demo_click" | "booking_click" | "form_start" | "quote_saved";
// Contrato sin datos personales. Sin proveedor ni transmisión hasta elegirlo.
export function track(event: AnalyticsEvent) {
  try {
    window.dispatchEvent(
      new CustomEvent("flores:analytics", { detail: { event } }),
    );
  } catch {
    /* La analítica nunca cambia el resultado del guardado. */
  }
}
