"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  businessTypes,
  services,
  budgets,
  timeframes,
  quoteSchema,
  fieldErrors,
  type Quote,
  type QuoteErrors,
  type SubmitQuote,
} from "@/lib/contracts/quote";
import { track } from "@/lib/analytics";
export function QuoteForm({
  submitAction,
  audience = "visitor",
}: {
  submitAction: SubmitQuote;
  audience?: "visitor" | "admin";
}) {
  const [channel, setChannel] = useState("correo");
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const logical = useRef<{ payload: string; key: string } | null>(null);
  const locked = useRef(false);
  const started = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  function start() {
    if (!started.current) {
      started.current = true;
      track("form_start");
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const raw = {
      ...Object.fromEntries(data),
      consent: data.get("consent") === "on",
    };
    const parsed = quoteSchema.safeParse(raw);
    setMessage("");
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      setErrors(fields);
      const first = Object.keys(fields)[0];
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    const payload = JSON.stringify(parsed.data);
    if (!logical.current || logical.current.payload !== payload)
      logical.current = { payload, key: crypto.randomUUID() };
    locked.current = true;
    setPending(true);
    try {
      const result = await submitAction(parsed.data, logical.current.key);
      if (result.status === "success") {
        setReference(result.reference);
        if (audience === "visitor") track("quote_saved");
      } else if (result.status === "invalid") {
        setErrors(result.errors);
        setMessage("Revisa los campos indicados y vuelve a intentarlo.");
        (
          form.elements.namedItem(
            Object.keys(result.errors)[0],
          ) as HTMLElement | null
        )?.focus();
      } else if (result.status === "rate_limited")
        setMessage(
          `Hay demasiados envíos. Espera ${Math.max(1, Math.ceil(result.retryAfterSeconds / 60))} minuto(s) antes de reintentar.`,
        );
      else setMessage(result.message);
    } catch {
      setMessage(
        "No pudimos confirmar el guardado. Conservamos lo que escribiste; vuelve a intentarlo.",
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  function error(name: keyof Quote) {
    return errors[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    ) : null;
  }
  function attrs(name: keyof Quote) {
    return {
      name,
      id: name,
      "aria-labelledby": name === "consent" ? undefined : `${name}-label`,
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }
  if (reference)
    return (
      <div className="form-panel" role="status">
        <h3>
          {audience === "admin" ? "Contacto registrado" : "Solicitud recibida"}
        </h3>
        <p>
          Referencia: <strong>{reference}</strong>
        </p>
        <p>
          {audience === "admin"
            ? "El contacto está disponible en la lista de solicitudes para su seguimiento."
            : "Revisaremos lo que nos cuentas y te contactaremos por el canal elegido para conversar sobre tu propuesta."}
        </p>
        <button
          className="button button-primary"
          onClick={() => {
            setReference("");
            setMessage("");
            logical.current = null;
            started.current = false;
          }}
        >
          Enviar otra solicitud
        </button>
        {audience === "admin" ? (
          <Link href="/admin/solicitudes">Ver solicitudes</Link>
        ) : null}
      </div>
    );
  return (
    <form
      method="post"
      className="form-panel"
      onSubmit={submit}
      noValidate
      onFocus={audience === "visitor" ? start : undefined}
      aria-labelledby="quote-title"
      aria-busy={pending}
    >
      <div hidden aria-hidden="true">
        <label>Sitio web<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <h3 id="quote-title">
        {audience === "admin" ? "Datos del contacto" : "Solicitar cotización"}
      </h3>
      <p className="form-hint">
        {audience === "admin"
          ? "Conserva el origen del contacto para identificar qué canal trae oportunidades."
          : "Cuéntanos lo esencial. Solicitar una propuesta no implica contratar."}
      </p>
      <noscript>
        <p>
          Activa JavaScript para usar este formulario. También puedes
          contactarnos por WhatsApp o correo.
        </p>
      </noscript>
      <div className="form-grid">
        <label htmlFor="name">
          <span id="name-label">Tu nombre</span>
          <input
            {...attrs("name")}
            autoComplete="name"
            required
            maxLength={80}
          />
          {error("name")}
        </label>
        <label htmlFor="business">
          <span id="business-label">Nombre del negocio</span>
          <input
            {...attrs("business")}
            autoComplete="organization"
            required
            maxLength={120}
          />
          {error("business")}
        </label>
        <label htmlFor="businessType">
          <span id="businessType-label">Tipo de negocio</span>
          <select {...attrs("businessType")} defaultValue="" required>
            <option value="" disabled>
              Selecciona una opción
            </option>
            {Object.entries(businessTypes).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
          {error("businessType")}
        </label>
        <label htmlFor="service">
          <span id="service-label">Servicio de interés</span>
          <select {...attrs("service")} defaultValue="" required>
            <option value="" disabled>
              Selecciona una opción
            </option>
            {Object.entries(services).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
          {error("service")}
        </label>
        <label className="full" htmlFor="description">
          <span id="description-label">¿Qué necesitas mejorar?</span>
          <textarea
            {...attrs("description")}
            required
            minLength={10}
            maxLength={2000}
            rows={4}
          />
          {error("description")}
        </label>
        <label className="full" htmlFor="channel">
          <span id="channel-label">¿Cómo prefieres que te contactemos?</span>
          <select
            {...attrs("channel")}
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
          >
            <option value="correo">Correo electrónico</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </label>
        <label
          className={channel === "correo" ? "preferred-contact" : ""}
          htmlFor="email"
        >
          <span id="email-label">
            Correo {channel === "whatsapp" ? "(opcional)" : ""}
          </span>
          <input
            {...attrs("email")}
            type="email"
            autoComplete="email"
            required={channel === "correo"}
            maxLength={254}
          />
          {error("email")}
        </label>
        <label
          className={channel === "whatsapp" ? "preferred-contact" : ""}
          htmlFor="phone"
        >
          <span id="phone-label">
            Teléfono {channel === "correo" ? "(opcional)" : ""}
          </span>
          <input
            {...attrs("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="+51 986 132 628"
            required={channel === "whatsapp"}
            maxLength={30}
          />
          {error("phone")}
        </label>
        <label htmlFor="budget">
          <span id="budget-label">Presupuesto aproximado (opcional)</span>
          <select {...attrs("budget")} defaultValue="por_definir">
            {Object.entries(budgets).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {error("budget")}
        </label>
        <label htmlFor="timeline">
          <span id="timeline-label">Plazo deseado (opcional)</span>
          <select {...attrs("timeline")} defaultValue="por_definir">
            {Object.entries(timeframes).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {error("timeline")}
        </label>
        <label className="check-label full" htmlFor="consent">
          <input {...attrs("consent")} type="checkbox" required />
          <span>
            {audience === "admin"
              ? "Confirmo que el contacto autorizó la atención de esta solicitud según el "
              : "Autorizo que me contacten para atender esta solicitud. He leído el "}
            <Link href="/privacidad">aviso de privacidad</Link>.
            {error("consent")}
          </span>
        </label>
      </div>
      <p className="form-hint">
        Usaremos tus datos para conversar sobre esta propuesta; no para
        suscribirte a campañas.
      </p>
      <button
        className="button button-primary"
        type="submit"
        disabled={pending}
      >
        {pending
          ? "Enviando…"
          : message
            ? "Reintentar envío"
            : audience === "admin"
              ? "Registrar contacto"
              : "Solicitar cotización"}
      </button>
      <p
        ref={status}
        className="form-feedback"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
