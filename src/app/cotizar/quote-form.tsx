'use client';
import { useActionState, useState } from 'react';
import { submitQuoteRequest } from '@/app/actions/quote-requests';
import { BUSINESS_TYPES, SERVICES, BUDGETS, TIMEFRAMES } from '@/lib/contracts/quote-requests';
export default function QuoteForm({ idempotencyKey }: { idempotencyKey: string }) {
  const [state, action, pending] = useActionState(submitQuoteRequest, null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const control = (name: string) => ({ name, id: name, value: values[name] ?? '', onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues(v => ({ ...v, [name]: e.target.value })), 'aria-invalid': !!(state && !state.ok && state.errors?.[name]) });
  if (state?.ok) return <div role="status" className="notice"><h2>Solicitud recibida</h2><p>Referencia: {state.reference}</p><a href="/cotizar">Enviar otra solicitud</a></div>;
  return <form action={action}>
    <input type="hidden" name="idempotency_key" value={idempotencyKey} />
    <div hidden aria-hidden="true"><label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label htmlFor="contact_name">Tu nombre<input {...control('contact_name')} required maxLength={80} autoComplete="name" /></label>
    <label htmlFor="business_name">Nombre del negocio<input {...control('business_name')} required maxLength={120} autoComplete="organization" /></label>
    <label htmlFor="business_type">Tipo de negocio<select {...control('business_type')} required><option value="">Elige una opción</option>{BUSINESS_TYPES.map(v => <option key={v}>{v}</option>)}</select></label>
    <label htmlFor="service">Servicio<select {...control('service')} required><option value="">Elige una opción</option>{SERVICES.map(v => <option key={v}>{v}</option>)}</select></label>
    <label htmlFor="description">¿Qué necesitas?<textarea {...control('description')} required minLength={10} maxLength={2000} /></label>
    <label htmlFor="preferred_channel">Canal de contacto<select {...control('preferred_channel')} required><option value="">Elige una opción</option><option value="correo">Correo</option><option value="whatsapp">WhatsApp</option></select></label>
    <label htmlFor="email">Correo<input {...control('email')} type="email" maxLength={254} autoComplete="email" required={values.preferred_channel === 'correo'} /></label>
    <label htmlFor="phone">Teléfono con código de país<input {...control('phone')} type="tel" maxLength={30} placeholder="+51 986 132 628" autoComplete="tel" required={values.preferred_channel === 'whatsapp'} /></label>
    <label htmlFor="budget">Presupuesto aproximado (PEN)<select {...control('budget')}><option value="">Sin especificar</option>{BUDGETS.map(v => <option key={v}>{v}</option>)}</select></label>
    <label htmlFor="timeframe">Plazo deseado<select {...control('timeframe')}><option value="">Sin especificar</option>{TIMEFRAMES.map(v => <option key={v}>{v}</option>)}</select></label>
    <label className="consent"><input type="checkbox" name="consent" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Autorizo a Flores Systems a guardar estos datos y contactarme para atender esta solicitud. <a href="/privacidad">Aviso de privacidad</a>.</span></label>
    {state && !state.ok ? <div role="alert" className="notice"><p>{({ invalid: 'Revisa los datos del formulario.', rate_limited: 'Has enviado varias solicitudes. Espera unos minutos antes de reintentar.', conflict: 'Esta clave ya se usó para otra solicitud. Recarga para iniciar una nueva.', unavailable: 'El envío no está disponible. Conservamos tus datos en este formulario para que puedas reintentar.', unauthorized: 'No se pudo completar la solicitud.' })[state.code]}</p>{Object.entries(state.errors ?? {}).map(([field, errors]) => <p key={field}><a href={`#${field}`}>{errors.join(' ')}</a></p>)}</div> : null}
    <button disabled={pending}>{pending ? 'Enviando…' : 'Enviar solicitud'}</button>
  </form>;
}
