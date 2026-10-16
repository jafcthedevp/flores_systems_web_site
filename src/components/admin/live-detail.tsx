"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { addNote, updateRequest, retryNotification } from "@/app/admin/actions";
import type { LiveLead } from "@/lib/server/live-crm";
import {
  statuses,
  outcomes,
  services,
  businessTypes,
  origins,
  budgets,
  timeframes,
} from "@/lib/contracts/quote";
export type Note = {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
};
export type History = {
  id: string;
  old_status: keyof typeof statuses | null;
  new_status: keyof typeof statuses;
  new_outcome: keyof typeof outcomes | null;
  close_reason: string | null;
  author_id: string | null;
  created_at: string;
};
export type Notification = {
  id: string;
  status: string;
  attempts: number;
  sent_at: string | null;
};
const date = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
function localDate(value: string | null) {
  if (!value) return "";
  return new Date(new Date(value).getTime() - 5 * 3600000)
    .toISOString()
    .slice(0, 16);
}
const utc = (value: FormDataEntryValue | null) =>
  value ? `${value}:00-05:00` : null;
export function LiveDetail({
  lead,
  notes,
  history,
  notifications,
}: {
  lead: LiveLead;
  notes: Note[];
  history: History[];
  notifications: Notification[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lock = useRef(false);
  const [message, setMessage] = useState("");
  const [nextStatus, setNextStatus] = useState(lead.status);
  function mutate(
    operation: () => Promise<{ ok: boolean; code?: string }>,
    done?: () => void,
  ) {
    if (lock.current) return;
    lock.current = true;
    startTransition(async () => {
      try {
        const result = await operation();
        if (result.ok) {
          setMessage("Cambios guardados.");
          done?.();
          router.refresh();
        } else
          setMessage(
            result.code === "conflict"
              ? "Esta solicitud cambió en otra pantalla. Recarga para revisar los datos antes de reintentar."
              : result.code === "unauthorized"
                ? "Tu sesión ya no tiene acceso. Vuelve a iniciar sesión."
                : "No se pudieron guardar los cambios. Revisa los datos y vuelve a intentarlo.",
          );
      } catch {
        setMessage(
          "No pudimos confirmar el cambio. Lo que escribiste sigue aquí; vuelve a intentarlo.",
        );
      } finally {
        lock.current = false;
      }
    });
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutate(() =>
      updateRequest({
        id: lead.id,
        version: lead.version,
        status: nextStatus,
        follow_up_at: utc(data.get("followUp")),
        quoted_at: utc(data.get("quotedAt")),
        quoted_amount: data.get("amount") || null,
        outcome: nextStatus === "cerrado" ? data.get("outcome") : null,
        close_reason:
          nextStatus === "cerrado" ? data.get("reason") || null : null,
      }),
    );
  }
  const labels: Record<string, string> = {
    pending: "Pendiente",
    processing: "Procesando",
    exhausted: "Reintentos agotados",
    accepted: "Aceptado por el proveedor; entrega no confirmada",
    sent: "Aceptado por el proveedor; entrega no confirmada",
    failed: "Fallido",
  };
  return (
    <main>
      <Link href="/admin/solicitudes">Volver a solicitudes</Link>
      <h1 className="admin-heading">{lead.business_name}</h1>
      <p>
        {lead.reference} ·{" "}
        <span className="badge">{statuses[lead.status]}</span>
      </p>
      <div className="admin-detail">
        <section className="form-panel">
          <h2>Solicitud de {lead.contact_name}</h2>
          <dl className="detail-fields">
            {[
              ["Negocio", lead.business_name],
              ["Rubro", businessTypes[lead.business_type]],
              ["Servicio", services[lead.service]],
              ["Canal preferido", lead.preferred_channel],
              ["Correo", lead.email || "No indicado"],
              ["Teléfono", lead.phone || "No indicado"],
              [
                "Presupuesto",
                lead.budget ? budgets[lead.budget] : "Aún no lo sé",
              ],
              [
                "Plazo",
                lead.timeframe ? timeframes[lead.timeframe] : "No indicado",
              ],
              [
                "Origen",
                origins[lead.source as keyof typeof origins] || lead.source,
              ],
              ["Recibida", `${date(lead.created_at)} (Lima)`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <h3>Necesidad</h3>
          <p className="preserve-text">{lead.description}</p>
          <div className="admin-actions">
            {lead.phone ? (
              <a
                className="button button-text"
                href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir WhatsApp
              </a>
            ) : null}
            {lead.email ? (
              <a className="button button-text" href={`mailto:${lead.email}`}>
                Redactar correo
              </a>
            ) : null}
          </div>
          <p className="form-hint">
            Abrir el contacto no cambia el estado comercial.
          </p>
          <h3>Historial</h3>
          <ol className="history">
            {history.map((item) => (
              <li key={item.id}>
                {item.old_status ? `${statuses[item.old_status]} → ` : ""}
                {statuses[item.new_status]}
                {item.new_outcome ? ` · ${outcomes[item.new_outcome]}` : ""}
                {item.close_reason ? ` · ${item.close_reason}` : ""}
                <br />
                <small>
                  {date(item.created_at)} · {item.author_id || "Formulario web"}
                </small>
              </li>
            ))}
          </ol>
          <h3>Notas internas</h3>
          <p className="form-hint">Estas notas no se envían al cliente.</p>
          {notes.length ? (
            <ul className="history">
              {notes.map((note) => (
                <li key={note.id}>
                  {note.body}
                  <br />
                  <small>
                    {date(note.created_at)} · {note.author_id}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Aún no hay notas. Registra lo que acordaste y el próximo paso.
            </p>
          )}
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const body = String(new FormData(form).get("note") || "").trim();
              if (body)
                mutate(
                  () => addNote({ request_id: lead.id, body }),
                  () => form.reset(),
                );
            }}
          >
            <label>
              Agregar nota
              <textarea name="note" required maxLength={4000} rows={4} />
            </label>
            <button className="button button-text" disabled={pending}>
              Guardar nota
            </button>
          </form>
        </section>
        <aside className="stack">
          <form className="form-panel stack" onSubmit={save}>
            <h2>Seguimiento</h2>
            <label>
              Estado
              <select
                value={nextStatus}
                onChange={(event) =>
                  setNextStatus(event.target.value as LiveLead["status"])
                }
              >
                {Object.entries(statuses).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {nextStatus === "cerrado" ? (
              <>
                <label>
                  Resultado de cierre
                  <select
                    name="outcome"
                    defaultValue={lead.outcome || "ganado"}
                  >
                    {Object.entries(outcomes).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Motivo (opcional)
                  <textarea
                    name="reason"
                    defaultValue={lead.close_reason || ""}
                    maxLength={1000}
                  />
                </label>
              </>
            ) : null}
            <label>
              Próximo contacto (hora de Lima)
              <input
                name="followUp"
                type="datetime-local"
                defaultValue={localDate(lead.follow_up_at)}
              />
            </label>
            <label>
              Fecha de cotización (hora de Lima)
              <input
                name="quotedAt"
                type="datetime-local"
                defaultValue={localDate(lead.quoted_at)}
                required={nextStatus === "cotizado"}
              />
            </label>
            <label>
              Monto cotizado en PEN (opcional)
              <input
                name="amount"
                inputMode="decimal"
                pattern="[0-9]{1,10}([.][0-9]{1,2})?"
                defaultValue={lead.quoted_amount || ""}
              />
            </label>
            <button className="button button-primary" disabled={pending}>
              {pending ? "Guardando…" : "Guardar seguimiento"}
            </button>
          </form>
          <section className="form-panel">
            <h3>Avisos</h3>
            {notifications.length ? (
              notifications.map((item) => (
                <div key={item.id}>
                  <p>
                    {labels[item.status] || item.status} · {item.attempts}{" "}
                    intento(s)
                  </p>
                  {item.status === "exhausted" ? (
                    <button
                      className="button button-text"
                      disabled={pending}
                      onClick={() => mutate(() => retryNotification(item.id))}
                    >
                      Reintentar aviso
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <p>No hay avisos para esta solicitud.</p>
            )}
          </section>
          <p role="status">{message}</p>
        </aside>
      </div>
    </main>
  );
}
