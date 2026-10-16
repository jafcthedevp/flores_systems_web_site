"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Lead } from "@/lib/server/crm";
import {
  businessTypes,
  services,
  statuses,
  outcomes,
  origins,
  budgets,
  timeframes,
} from "@/lib/contracts/quote";
const format = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
export function LeadDetail({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState(lead.status);
  const [history, setHistory] = useState([
    { text: "Solicitud creada", at: lead.createdAt },
  ]);
  const [notes, setNotes] = useState<{ text: string; at: string }[]>([]);
  const [followUp, setFollowUp] = useState(lead.followUp);
  const [notice, setNotice] = useState("");
  const [notification, setNotification] = useState(lead.notification);
  function saveStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = data.get("status") as Lead["status"];
    const result = data.get("outcome") as keyof typeof outcomes;
    const reason = String(data.get("reason") || "").trim();
    setStatus(next);
    setHistory((items) => [
      ...items,
      {
        text: `${status === "cerrado" && next !== "cerrado" ? "Reapertura: " : ""}${statuses[status]} → ${statuses[next]}${next === "cerrado" ? ` · ${outcomes[result]}` : ""}${reason ? ` · ${reason}` : ""}`,
        at: new Date().toISOString(),
      },
    ]);
    setNotice("Cambio aplicado solo a esta vista previa.");
  }
  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = String(new FormData(form).get("note") || "").trim();
    if (!text) return;
    setNotes((items) => [...items, { text, at: new Date().toISOString() }]);
    form.reset();
  }
  const notificationLabels = {
    pendiente: "Pendiente",
    fallido: "Fallido",
    aceptado: "Aceptado por el proveedor; entrega no confirmada",
    entregado: "Entrega confirmada (ejemplo)",
  };
  return (
    <main>
      <Link href="/admin/solicitudes">Volver a solicitudes</Link>
      <h1 className="admin-heading">{lead.business}</h1>
      <span className="badge">{statuses[status]}</span>
      <div className="admin-detail">
        <section className="form-panel">
          <h2>Datos de la solicitud</h2>
          <dl className="detail-fields">
            {[
              ["Contacto", lead.name],
              ["Negocio", lead.business],
              ["Rubro", businessTypes[lead.businessType]],
              ["Servicio", services[lead.service]],
              ["Correo", lead.email || "No indicado"],
              ["Teléfono", lead.phone || "No indicado"],
              ["Canal preferido", lead.channel],
              ["Origen", origins[lead.origin]],
              [
                "Presupuesto",
                lead.budget ? budgets[lead.budget] : "Aún no lo sé",
              ],
              [
                "Plazo",
                lead.timeline ? timeframes[lead.timeline] : "No indicado",
              ],
              ["Recibida", `${format(lead.createdAt)} (Lima)`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <h3>Necesidad</h3>
          <p>{lead.description}</p>
          <p>
            Estos contactos son ficticios; los enlaces de comunicación están
            deshabilitados en la vista previa.
          </p>
          <h3>Historial</h3>
          <ol className="history">
            {history.map((item, index) => (
              <li key={index}>
                {item.text}
                <br />
                <small>{format(item.at)} · Administrador de ejemplo</small>
              </li>
            ))}
          </ol>
          <h3>Notas internas</h3>
          <p className="form-hint">
            Son para seguimiento interno; no se envían al cliente.
          </p>
          <ul className="history">
            {notes.map((note, index) => (
              <li key={index}>
                {note.text}
                <br />
                <small>{format(note.at)} · Administrador de ejemplo</small>
              </li>
            ))}
          </ul>
          {!notes.length ? (
            <p>Aún no hay notas. Agrega el próximo paso que acordaste.</p>
          ) : null}
          <form className="stack" onSubmit={addNote}>
            <label>
              Agregar nota
              <textarea name="note" required maxLength={2000} rows={3} />
            </label>
            <button className="button button-text">Agregar nota interna</button>
          </form>
        </section>
        <aside className="stack">
          <form className="form-panel stack" onSubmit={saveStatus}>
            <h2>Seguimiento comercial</h2>
            <label>
              Estado
              <select name="status" defaultValue={status}>
                {Object.entries(statuses).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Resultado de cierre
              <select name="outcome" defaultValue="ganado">
                {Object.entries(outcomes).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <p className="form-hint">
              El resultado se aplica al cerrar. Reabrir conserva el historial y
              limpia el resultado vigente.
            </p>
            <label>
              Motivo (opcional)
              <input name="reason" maxLength={500} />
            </label>
            <button className="button button-primary">
              Aplicar en vista previa
            </button>
          </form>
          <form
            className="form-panel stack"
            onSubmit={(event) => {
              event.preventDefault();
              const value = String(
                new FormData(event.currentTarget).get("followUp") || "",
              );
              setFollowUp(value ? `${value}:00-05:00` : "");
              setNotice("Seguimiento actualizado solo en esta vista previa.");
            }}
          >
            <h3>Próximo contacto</h3>
            <label>
              Fecha y hora de Lima
              <input type="datetime-local" name="followUp" />
            </label>
            <p>
              {followUp ? format(followUp) : "Sin fecha de seguimiento"}{" "}
              (America/Lima)
            </p>
            <button className="button button-text">Aplicar fecha</button>
          </form>
          <section className="form-panel">
            <h3>Aviso de nueva solicitud</h3>
            <p role="status">{notificationLabels[notification]}</p>
            {notification === "fallido" || notification === "pendiente" ? (
              <button
                className="button button-text"
                onClick={() => {
                  setNotification("pendiente");
                  setNotice(
                    "Simulación: aviso pendiente. No se envió ningún correo.",
                  );
                }}
              >
                Simular reintento
              </button>
            ) : null}
          </section>
          <p role="status">{notice}</p>
        </aside>
      </div>
    </main>
  );
}
