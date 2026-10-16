"use client";
import { useState } from "react";
import { origins, toBackend, type Quote } from "@/lib/contracts/quote";
import { QuoteForm } from "@/components/quote-form/quote-form";
import { createManualRequest } from "@/app/admin/actions";
import { z } from "zod";
export function ManualLead({ preview = false }: { preview?: boolean }) {
  const [origin, setOrigin] = useState("whatsapp");
  const [result, setResult] = useState<Quote | null>(null);
  return (
    <>
      <label>
        Origen del contacto
        <select
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
        >
          {Object.entries(origins)
            .filter(([key]) => key !== "formulario_web")
            .map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
        </select>
      </label>
      <p className="form-hint">
        {preview
          ? "Usa únicamente datos ficticios y autorización de ejemplo."
          : "Registra la información facilitada por el contacto y la autorización correspondiente a esta solicitud."}
      </p>
      <QuoteForm
        audience="admin"
        submitAction={async (data, key) => {
          if (preview) {
            setResult(data);
            return {
              status: "temporary",
              message:
                "Datos validados en vista previa. No se creó una solicitud real.",
            };
          }
          const payload = Object.fromEntries(
            Object.entries(toBackend(data, key)).filter(
              ([name]) =>
                !["idempotency_key", "website", "consent"].includes(name),
            ),
          );
          const saved = await createManualRequest({
            ...payload,
            source: origin,
          });
          if (!saved.ok)
            return {
              status: "temporary",
              message:
                "No pudimos confirmar el registro. Revisa los datos y vuelve a intentarlo.",
            };
          const confirmation = z
            .object({ reference: z.string() })
            .safeParse(saved.data);
          return confirmation.success
            ? { status: "success", reference: confirmation.data.reference }
            : {
                status: "temporary",
                message:
                  "El servidor no devolvió la referencia. Revisa la lista antes de crear otro registro.",
              };
        }}
      />
      {result ? (
        <section className="notice" role="status">
          Vista previa: {result.name} · {result.business} ·{" "}
          {origins[origin as keyof typeof origins]}. Sin persistencia.
        </section>
      ) : null}
    </>
  );
}
