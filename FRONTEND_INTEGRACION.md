# Integración frontend / backend

Frontend implementado y verificado localmente. Hay otra sesión encargada del backend.

- `src/app/layout.tsx`, `src/app/page.tsx`, `landing.css`, `ui.css`, componentes de landing, demos, cotización y las rutas `/admin/solicitudes` son responsabilidad de frontend.
- La portada Next.js está en `page.tsx`; el HTML original se conserva en `/referencia`. No crear `src/app/route.ts` porque colisiona con la portada.
- Se conservan las rutas de backend `/admin`, `/admin/login`, `/admin/password`, `/cotizar`, y sus acciones. La vista previa del frontend usa `/admin/vista-previa`, sin colisión con `/admin`.
- Frontend consume `src/lib/contracts/quote-requests.ts` y `src/app/actions/quote-requests.ts` mediante adaptadores propios (`contracts/quote.ts`, `app/actions/quote.ts`). No cambiar nombres ni resultados sin coordinar.
- Las rutas administrativas de frontend usan `getAdmin` / `requireAdmin`, `getRequest` y las mutaciones de `admin/actions.ts`. La portada administrativa conserva sus consultas y contadores de backend y añade enlaces al panel de seguimiento. El adaptador `src/lib/server/live-crm.ts` aplica paginación y filtros autorizados, incluidas fechas de Lima. No crea tablas ni cambia RLS.
- No publicar aún: dominio, agenda, aviso de privacidad definitivo y prueba integrada de recepción/correo están pendientes.

## Contratos que deben mantenerse al integrar

- `submitQuoteRequest(null, form)` devuelve `{ ok: true, reference }` solo después de guardar; los fallos usan `invalid`, `rate_limited`, `conflict`, `unavailable` o `unauthorized`.
- El formulario reutiliza la clave al reintentar sin cambios. Cambiar los datos inicia otro envío lógico. Los contactos de WhatsApp/correo se registran manualmente y abrir esos canales no cambia estados.
- El panel consume `getRequest`, `updateRequest`, `addNote`, `createManualRequest` y `retryNotification`. Las mutaciones de seguimiento envían `version`; el frontend espera confirmación y refresca desde servidor.
- Las fechas de los controles se interpretan como hora de Lima (`-05:00`). Al reabrir, el frontend envía `outcome: null` y `close_reason: null` conservando el historial del backend.
- El estado real `accepted` de un aviso se presenta como aceptado por el proveedor, sin afirmar entrega; se conserva `sent` como alias visual. Solo `exhausted` habilita reintento manual. La entrega confirmada requiere datos adicionales de backend.
- El registro manual espera que `createManualRequest` devuelva `data.reference`. Si se pierde la respuesta a una creación manual, revisar la lista antes de reintentar: el contrato actual de esa acción no tiene una clave de idempotencia.
- Se conservan las rutas auxiliares de backend `/cotizar` y `/admin/password`. El formulario principal de frontend está en `/#contacto`.

Ver comandos, rutas, configuración y pendientes en [README_FRONTEND.md](README_FRONTEND.md). No se hicieron escrituras ni despliegues en el proyecto remoto desde esta sesión.
