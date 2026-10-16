# Integración del backend con el frontend

Backend implementado el 15/10/2026. Proyecto: `flores_systems`, ref `shonvjevhinvllfjndbq`. Migraciones aplicadas, tipos generados desde Supabase y Edge Function desplegada. La recepción pública sigue deshabilitada hasta configurar credenciales, correo, IP confiable, cuenta administradora y los requisitos de publicación. Estado operativo en [operacion.md](operacion.md).

Las pantallas, diseños, demos y componentes pertenecen al trabajo de frontend. Se conserva su portada `page.tsx`; no crear un `route.ts` en la raíz. Se mantienen `/cotizar`, `/admin` y `/admin/password` conforme a `FRONTEND_INTEGRACION.md`; el seguimiento vive en `/admin/solicitudes` y la vista previa en `/admin/vista-previa`. Los ajustes de compatibilidad del backend se limitan al campo trampa y a representar `accepted` y el reintento de avisos `exhausted` con el contrato real.

## Recepción pública

Fuente de reglas: `src/lib/contracts/quote-requests.ts` (`quoteSchema`, catálogos y `PRIVACY_VERSION`). Campos:

```ts
{
  contact_name, business_name, business_type, service, description,
  preferred_channel: 'correo' | 'whatsapp', email: string | null,
  phone: string | null, budget: string | null, timeframe: string | null,
  consent: true, idempotency_key: string /* UUID aleatorio */, website: ''
}
```

`src/app/actions/quote-requests.ts` exporta `submitQuoteRequest(previousState, FormData)`. Checkbox `consent=on`. La respuesta es `ActionResult`: `{ok:true,reference}` tras el commit, o `{ok:false,code,errors?,retryAfter?}`. Los códigos son `invalid`, `rate_limited`, `conflict`, `unavailable`. Los errores por campo son listas de mensajes. `retryAfter` está en segundos.

Conservar el UUID y los valores tras un fallo de red. Generar un nuevo UUID solo al empezar otra oportunidad. Una respuesta `unavailable` no confirma guardado. El formulario no envía estado, origen, versión del aviso, destinatario ni autor. El servidor asigna esos datos.

El adaptador de frontend existente `src/app/actions/quote.ts` ya traduce sus nombres al contrato de backend. Mantenerlo como puente; no duplicar las reglas Zod. La recepción permanecerá cerrada mientras `QUOTE_RATE_LIMIT_ENABLED` no sea `true` o falten IP confiable y secretos.

## Autenticación

`src/app/auth/actions.ts` exporta `signIn(FormData)`, `signOut()`, `requestPasswordReset(FormData)` y `changePassword(FormData)`. Los formularios deben nombrar `email` y `password`. Son Server Actions; usar `action` o invocarlas desde un flujo que permita sus redirecciones.

`signIn` valida credenciales y membresía en `admin_users`; una cuenta autenticada ordinaria no accede al panel. `getAdmin()` devuelve `{client,user}` o `null`; `requireAdmin()` rechaza con `UNAUTHORIZED`. Cada consulta y acción privada vuelve a comprobar autorización. El proxy solo renueva la sesión; no sustituye estas comprobaciones.

Rutas de retorno: `/auth/callback` para PKCE y `/auth/confirm?token_hash=...&type=recovery` (o `invite`) para plantillas OTP. Ambos redirigen a `/admin/restablecer` sin aceptar destinos arbitrarios. Proteger también esa pantalla con `requireAdmin()`. Las acciones devuelven resultados genéricos para no enumerar cuentas. Configurar SMTP y plantillas antes de ofrecer recuperación real.

El modo de vista previa del frontend puede mostrar exclusivamente sus datos ficticios en desarrollo. No permite consultar ni modificar las tablas reales. Para modo real, sustituir `requirePreview()` y `sampleLeads` por los helpers autorizados de abajo; mantener el guard de sesión en el layout privado y dentro de las operaciones.

## Lecturas privadas

`src/lib/data/requests.ts` exporta:

| Función | Entrada y salida |
| --- | --- |
| `listRequests(filters)` | `{page,status?,source?,search?,from?,to?,pending?}`; fechas `YYYY-MM-DD` de Lima, `pending` booleano. Devuelve `{rows,count,page,pageSize,pages}`; 25 filas, orden fecha/ID descendente |
| `getRequest(id)` | UUID interno. Devuelve `{request,notes,history,notifications}`. `request=null` si no existe; el frontend puede ejecutar `notFound()` |
| `getCounters()` | Objeto con `nuevo`, `en_conversacion`, `cotizado`, `cerrado`, `seguimientos_pendientes` |

Los nombres de columna siguen la base: `contact_name`, `business_name`, `created_at`, `follow_up_at`, `source`. Los tipos están en `src/lib/supabase/database.types.ts`, generados del proyecto remoto mediante MCP. Los estados de aviso son `pending`, `processing`, `accepted`, `exhausted`. `accepted` no significa entregado; no mostrar confirmación de entrega sin webhook verificado.

## Mutaciones privadas

`src/app/admin/actions.ts` exporta:

| Acción | Entrada |
| --- | --- |
| `updateRequest(input)` | `{id,version,status,follow_up_at,quoted_amount,quoted_at,outcome,close_reason}`. Fechas ISO con zona o `null`; monto decimal como texto o `null`; moneda PEN |
| `addNote(input)` | `{request_id,body}`; entre 1 y 4.000 caracteres; inmutable |
| `createManualRequest(input)` | Campos de `contactSchema` + `source`: WhatsApp, correo, prospección u otro; sin consentimiento ficticio ni `formulario_web` |
| `retryNotification(jobId)` | UUID de aviso agotado; solo dentro de la ventana segura |

Respuesta `{ok:true,data?}` o `{ok:false,code}`. `code` es `invalid`, `unauthorized`, `conflict` o `unavailable`. En conflicto de versión, recargar el detalle y pedir revisar los cambios; no sobrescribir silenciosamente. Después de guardar, refrescar detalle/listado (las acciones invalidan `/admin`). Al reabrir, enviar `outcome=null` y `close_reason=null`; el historial conserva el cierre anterior.

Interpretar `datetime-local` en Lima con `-05:00` antes de enviar. Mostrar UTC con `Intl.DateTimeFormat` y `timeZone:'America/Lima'`. No hacer cálculos monetarios en punto flotante.
