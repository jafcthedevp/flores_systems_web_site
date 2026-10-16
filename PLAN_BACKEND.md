# Plan backend — Flores Systems

**Estado:** backend implementado, esquema aplicado en Supabase y procesador desplegado; activación pendiente de credenciales y configuración operativa. Revisión del 15 de octubre de 2026.  
**Objetivo:** guardar solicitudes, avisar a Anthony y ofrecer seguimiento privado y recuperable.  
**Documentos relacionados:** [plan maestro](PLAN_IMPLEMENTACION.md), [frontend](PLAN_FRONTEND.md), [versiones](VERSIONES_TECNOLOGIAS.md).

El backend combina el código de servidor de Next.js con PostgreSQL, Auth, Cron y Edge Functions de Supabase. La separación documental no obliga a crear un servidor o repositorio adicional.

## Ejecución actual

| Fase | Resultado |
| --- | --- |
| BE-0 | Dependencias fijadas, clientes separados, configuración local y tipos remotos generados; falta completar secretos y hosting |
| BE-1 | Validación, cuota compartida e inserción atómica aplicadas y probadas localmente y en Supabase; recepción pública deshabilitada |
| BE-2 | Cola, reintentos, plantilla y Edge Function `send-notifications` desplegados; faltan dominio, Resend, secretos y habilitar Cron |
| BE-3 | Sesión SSR, autorización, consultas y mutaciones implementadas y RLS verificado; falta cuenta de Anthony, cerrar signup remoto y SMTP |
| BE-4 | 46 pruebas, tipos, lint y compilación verificados; guía de operación lista; faltan correo real, restauración, alertas, privacidad y publicación |
| BE-5 | Opcional, pospuesto; no se conectó WhatsApp automático |

Proyecto: `flores_systems` (`shonvjevhinvllfjndbq`), `us-east-1`, PostgreSQL 17.11. Migraciones sincronizadas con el historial remoto: `20261015223054_backend_foundation` y `20261015224108_notification_references`.

Ver [operación y pendientes reales](docs/operacion.md) y [contrato para frontend](docs/contrato-backend.md). Los checks siguientes distinguen implementación existente de tareas que necesitan activación o comprobación externa; no indican que el sitio esté publicado.

## Responsabilidades y límites

- Recepción pública: Server Action → validación → límite de envíos → transacción de solicitud y aviso.
- Panel: sesión validada → autorización de Anthony → lectura o modificación con políticas RLS.
- Avisos: cola persistente → procesador privado → proveedor de correo; WhatsApp se añade después.
- Demos comerciales: datos ficticios locales; no construir aquí los sistemas reales de veterinaria, restaurante o tienda.
- Contrato de campos, estados y respuestas: [plan maestro](PLAN_IMPLEMENTACION.md#2-contrato-compartido-del-formulario-y-el-crm).
- Claves secretas, destinatarios internos y permisos se controlan exclusivamente en servidor.

## BE-0 — Entornos y base técnica

**Objetivo:** tener configuración reproducible sin mezclar pruebas y clientes reales.

- [x] Preparar Migraciones a Supabase mediante su MCP a un proyecto creado para producción.
- [x] Fijar SDK, SSR y CLI conforme a la [matriz de versiones](VERSIONES_TECNOLOGIAS.md).
- [ ] Usar la misma rama LTS de Node en desarrollo y hosting; registrar el parche real del hosting.
- [x] Registrar la versión de PostgreSQL y las extensiones disponibles del proyecto; no asumir que coincide con el último PostgreSQL upstream.
- [x] Elegir y documentar el flujo de esquema: migraciones SQL o esquemas declarativos.
- [x] Conservar migraciones y tipos generados en el repositorio.
- [x] Crear clientes separados: sesión de usuario y cliente privilegiado exclusivo del servidor.
- [x] Usar claves publishable para la configuración pública y claves secret solo en servidor.
- [ ] Definir dominio, remitente y destinatario de avisos en configuración privada.
- [ ] Configurar tokens acotados a proyecto y permisos cuando se utilice CLI, CI o MCP.
- [x] Leer changelog y documentación actuales antes de implementar funciones de Supabase.

El changelog consultado mantiene SSR como integración de sesiones del framework; no agregar adaptadores retirados por inercia. [Changelog oficial](https://supabase.com/changelog), [SSR para Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

**Criterio de cierre:** configuración de pruebas repetible, secretos documentados por nombre y versiones reales registradas; sin credenciales en Git.

## BE-1 — Persistencia y recepción de solicitudes

**Objetivo:** cada solicitud válida queda guardada, aun si el canal de avisos falla.

- [x] Crear `quote_requests` y `notification_jobs` con restricciones y permisos revisados.
- [x] Implementar el contrato de entrada compartido con Zod y validación definitiva en servidor.
- [x] Asignar campos internos desde servidor y validar catálogos permitidos.
- [x] Normalizar correo y teléfono; mantener al menos una vía válida y exigir la del canal preferido.
- [x] Registrar la aceptación real del aviso, su versión y fecha del servidor.
- [x] Implementar una clave de idempotencia única por envío lógico.
- [x] Guardar solicitud y aviso pendiente en una transacción de PostgreSQL.
- [x] Permitir oportunidades distintas de un mismo contacto.
- [x] Devolver éxito después del commit y una referencia segura.
- [x] Devolver errores limitados por campo, exceso de envíos, conflicto de idempotencia y fallo temporal.
- [x] Aplicar límite de tamaño, campo trampa y límite compartido de envíos.
- [ ] Proponer PostgreSQL como almacén inicial del límite; confirmar frente a Upstash antes de implementarlo.
- [ ] Si se incorpora Turnstile, verificar el token en servidor.
- [x] No permitir al visitante decidir destinatarios, estado comercial o privilegios.
- [x] No exponer lectura anónima ni inserción directa sin los controles del servidor.

**Permisos de la recepción**

El cliente privilegiado elude RLS: debe quedar aislado en módulos de servidor y utilizarse para operaciones delimitadas. La función de inserción se ejecutará con permisos expresamente concedidos al rol de servicio, revocando ejecución a `PUBLIC`, `anon` y usuarios ordinarios. Preferir funciones `SECURITY INVOKER`; revisar por separado cualquier necesidad real de privilegios elevados.

Una respuesta a un reintento no debe revelar solicitudes ajenas: la clave debe ser no adivinable y el servidor no debe exponer una búsqueda pública general por contacto o identificador.

**Depende de:** BE-0 y contrato del plan maestro.  
**Criterio de cierre:** guardado atómico, reintento sin duplicación y rechazo de entradas inválidas o acceso directo no autorizado.

## BE-2 — Avisos por correo y recuperación de fallos

**Objetivo:** generar avisos persistentes, trazables y reintentables.

- [x] Integrar Resend con el SDK fijado; usar plantilla HTML simple.
- [ ] Verificar el dominio remitente y configurar los registros DNS requeridos.
- [x] Configurar el destinatario `flores.anthony.489@gmail.com` solo en servidor.
- [x] Enviar resumen y referencia; agregar enlace al panel cuando FE-3 y BE-3 estén disponibles.
- [x] Implementar una Edge Function privada que procese avisos pendientes.
- [ ] Invocarla periódicamente mediante Supabase Cron con credenciales guardadas de forma segura.
- [x] Autorizar explícitamente al programador; no aceptar un secreto público como prueba de autorización del procesador.
- [x] Reclamar trabajos con una operación atómica, bloqueo con vencimiento y recuperación de trabajos abandonados.
- [x] Implementar reintentos con espera creciente, máximo de intentos y registro de último error.
- [x] Usar una clave estable de idempotencia del proveedor cuando la admita.
- [x] Definir qué hacer al superar la ventana de idempotencia: no reenviar indefinidamente sin control.
- [x] Registrar ID del proveedor, estado, intentos y fechas.
- [x] Distinguir aviso pendiente, en proceso, aceptado por el proveedor y fallo agotado.
- [x] Habilitar reintento manual solo al administrador.
- [ ] Implementar eventos de entrega/rebote si se necesita confirmación de entrega; verificar firma del webhook.
- [x] Mantener las notas internas fuera de las notificaciones al cliente.

**Comportamiento:** el objetivo inicial es avisar en 1–2 minutos bajo operación normal. Un proveedor que acepta el correo no garantiza su llegada a bandeja de entrada. La recuperación se diseña con reintentos e idempotencia; no se promete entrega exactamente una vez.

La cola se guarda antes del procesamiento para que no dependa de una tarea en memoria al terminar la petición de Next.js. [Programación oficial de Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions).

**Depende de:** BE-1, dominio y credenciales del proveedor.  
**Criterio de cierre:** aviso real verificable; un fallo conserva la solicitud y el trabajo recuperable sin crear otra oportunidad.

## BE-3 — Autenticación y operaciones del mini CRM

**Objetivo:** permitir a Anthony consultar y trabajar las oportunidades con acceso exclusivo.

**Acceso**

- [ ] Crear la cuenta administradora de Anthony mediante un procedimiento controlado.
- [ ] Desactivar el registro público de cuentas.
- [x] Usar Supabase Auth con sesiones en cookies mediante `@supabase/ssr`.
- [x] Autorizar por el identificador de usuario de Supabase en una lista de administradores administrada fuera del formulario público.
- [x] Comprobar autorización en cada lectura y modificación sensible; proteger también con RLS.
- [x] Evitar caché compartida de páginas y respuestas autenticadas.
- [ ] Configurar recuperación de contraseña con SMTP propio antes de publicar.

La integración oficial de Supabase para SSR contempla sesiones en cookies. La autenticación debe acompañarse de controles de autorización en el servidor. [Supabase SSR](https://supabase.com/docs/guides/auth/server-side), [Next.js: autenticación](https://nextjs.org/docs/app/guides/authentication). El SMTP predeterminado de Supabase está destinado a pruebas; configurar un proveedor propio para los correos de acceso y recuperación. [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

**Autorización y sesiones**

- [x] Validar la sesión en el servidor conforme a SSR; no confiar solo en `getSession()` ni en una cookie sin verificar.
- [x] Mantener una lista controlada de identificadores administradores que el visitante no puede modificar.
- [x] No usar `user_metadata` editable como fuente de autorización.
- [x] Verificar el administrador en cada consulta, Server Action y operación sensible.
- [x] Proteger rutas y operaciones; un redirect en `proxy.ts` no sustituye la autorización.
- [x] Aplicar RLS junto con permisos de tabla y de funciones explícitos.
- [x] Distinguir autenticación de autorización: pertenecer al rol `authenticated` no basta.
- [x] Definir políticas de lectura y de actualización compatibles; las actualizaciones deben controlar filas visibles y valores admitidos.
- [x] Usar sesiones de usuario para consultas y modificaciones ordinarias del panel, conservando RLS.
- [x] Evitar caché compartida en consultas, páginas y respuestas privadas.

**Operaciones**

- [x] Consultas paginadas, filtros y búsqueda por contacto, negocio, correo o teléfono.
- [x] Leer el detalle por ID únicamente tras autorización.
- [x] Crear oportunidades manuales con origen explícito.
- [x] Guardar cambio de estado e historial en una transacción.
- [x] Registrar autor y fecha en notas e historial.
- [x] Agregar notas sin edición destructiva en la primera versión.
- [x] Guardar fecha de seguimiento, monto opcional y fecha de cotización.
- [x] Registrar resultado y motivo de cierre; permitir reapertura conservando el historial.
- [x] Aplicar una comprobación de versión o fecha de actualización para no sobrescribir cambios concurrentes.
- [x] Calcular contadores por estado y seguimientos pendientes.
- [x] Consultar trabajos de aviso y autorizar su reintento manual.
- [x] Mantener creación y datos internos de avisos fuera del alcance de visitantes.

**Criterio de cierre:** Anthony opera el CRM; un visitante y una segunda cuenta sin privilegios no obtienen ni modifican datos, tampoco mediante llamadas directas.

## Modelo de datos propuesto

Cada registro representa una solicitud u oportunidad. Un mismo contacto puede tener varias.

| Tabla | Fase | Datos principales |
| --- | --- | --- |
| `quote_requests` | BE-1 | ID, clave única de envío, nombre, negocio, sector, servicio, correo, teléfono, canal preferido, descripción, presupuesto, plazo, autorización, estado, origen y fechas |
| `notification_jobs` | BE-1/BE-2 | Solicitud, canal, destinatario configurado, estado, intentos, próximo intento, bloqueo temporal, ID del proveedor, error y fecha de envío |
| `request_notes` | BE-3 | Solicitud, texto, autor y fecha |
| `request_status_history` | BE-3 | Solicitud, estado anterior, estado nuevo, autor y fecha |

En BE-3, ampliar `quote_requests` con próxima fecha de seguimiento, monto cotizado opcional, fecha de cotización, resultado y motivo del cierre. La lista de administradores debe quedar en configuración protegida, no en datos editables por visitantes.

**Restricciones mínimas:** claves foráneas, valores de estado válidos, al menos un contacto válido, unicidad de la clave de envío y del aviso lógico por solicitud/canal/destinatario. Indexar fechas y estados utilizados por la lista y la cola.

El cambio de estado y su historial deben guardarse juntos en una transacción. No incluir eliminación definitiva de solicitudes en el primer panel.

**Detalles para concretar al implementar**

- Identificadores UUID; fechas `timestamptz`, almacenadas en UTC y presentadas en `America/Lima`.
- Monto cotizado con tipo decimal y moneda definida; evitar punto flotante para importes. El presupuesto solicitado puede ser un rango del catálogo.
- Restricciones de estado, longitud, contactos requeridos y combinaciones de cierre.
- Índices según filtros y orden reales: fecha/ID, estado/fecha, próxima fecha de seguimiento y selección de avisos pendientes.
- Índices de claves foráneas cuando se utilicen para consulta o mantenimiento.
- Índices de búsqueda solo al definir cómo se busca; medir consultas antes de añadir índices sin propósito.
- Tabla o configuración protegida para administradores y tabla interna si el límite de envíos usa PostgreSQL.
- Avisos sin claves de proveedor en sus filas; los secretos viven en el entorno o gestor de secretos.
- Vistas futuras sujetas al modelo de permisos; evitar que omitan RLS de manera inadvertida.
- Revisar permisos de las funciones RPC y los asesores de Supabase antes de guardar el esquema definitivo.

Este modelo ya está creado mediante migraciones en `flores_systems`. Las comprobaciones remotas se ejecutaron dentro de una transacción revertida y no conservaron solicitudes de prueba.

## BE-4 — Publicación, privacidad y operación

- [ ] Separar secretos y datos entre pruebas y producción.
- [ ] Verificar dominio, remitente, SMTP de Auth y URLs permitidas de recuperación.
- [ ] Revisar registro público desactivado, políticas RLS y permisos de funciones.
- [x] Ejecutar pruebas de validación, idempotencia, autorización y transacciones.
- [ ] Probar el flujo integrado con el frontend y un correo real de prueba.
- [ ] Configurar registros y alertas para fallos de guardado, avisos agotados y tareas abandonadas.
- [x] Reducir datos personales en registros y mensajes de error.
- [ ] Supervisar cuota de base de datos, avisos, cómputo y limpieza de registros de Cron.
- [ ] Decidir si el riesgo de pausa del plan gratuito es aceptable para la captación.
- [ ] Establecer respaldo/exportación y probar restauración.
- [ ] Definir conservación y eliminación de contactos, incluida la gestión de respaldos.
- [ ] Concretar la revisión de privacidad de la fase común, incluidos los servicios externos.
- [ ] Medir solicitudes confirmadas por origen; no interpretar clics como contactos recibidos.
- [x] Documentar recuperación de cuenta, reintento de avisos y atención diaria.
- [x] Revalidar versiones y avisos de seguridad antes del despliegue.

**Criterio de cierre:** solicitud de prueba guardada, aviso recibido, seguimiento desde el panel y datos recuperables. Los controles aplicables se completan también si se publica primero solo el formulario.

## BE-5 — WhatsApp automático, opcional

**Objetivo:** añadir un segundo canal de avisos cuando el volumen o la forma de trabajar lo requieran.

- [ ] Elegir WhatsApp Business Platform o un proveedor oficial.
- [ ] Definir un número remitente habilitado para la API y el número personal destinatario de los avisos.
- [ ] Confirmar condiciones del número existente antes de migrarlo; no asumir que el número personal puede usarse también como remitente para avisarse a sí mismo.
- [ ] Preparar las plantillas y permisos exigidos por el canal para iniciar mensajes.
- [ ] Calcular tarifas según destino, categoría y proveedor.
- [ ] Reutilizar la cola de avisos con canal `whatsapp`, sus reintentos y estados.
- [ ] Mantener el correo como respaldo y evitar avisos duplicados innecesarios.
- [ ] Incorporar seguimiento de entrega mediante webhooks autenticados si el proveedor lo permite.

Un enlace `wa.me` abre una conversación que envía el visitante; no genera un aviso automático ni guarda por sí mismo un registro en el CRM. Los contactos que lleguen por ese enlace se registran manualmente en BE-3 y FE-3.

Las tarifas de la plataforma dependen del mercado y del tipo de mensaje; cotizarlas al iniciar esta fase. [Precios oficiales de WhatsApp Business Platform](https://business.whatsapp.com/products/platform-pricing).

**Criterio de cierre:** una solicitud guardada produce el aviso esperado y un fallo de WhatsApp conserva la solicitud y el respaldo por correo.

## Organización orientativa del código de servidor

```text
src/app/actions/quote-requests.ts
src/app/admin/actions.ts
src/app/auth/                     Callbacks o flujos de Auth que se requieran
src/app/api/webhooks/             Solo si hay webhooks de proveedores
src/lib/contracts/               Tipos y validaciones compartidos sin secretos
src/lib/supabase/server.ts        Cliente con sesión
src/lib/supabase/admin.ts         Cliente privilegiado; solo servidor
src/lib/auth/                    Autorización del administrador
src/lib/data/                    Consultas autorizadas
src/lib/services/                Casos de uso y límites de envío
src/proxy.ts                     Integración SSR, si corresponde
supabase/migrations/
supabase/functions/send-notifications/
docs/operacion.md
```

Elegir un flujo de migraciones antes de crear SQL. Si se usan esquemas declarativos, la estructura se adapta a `supabase/schemas/`. Descubrir comandos con la ayuda de la CLI fijada y revisar cambios en desarrollo antes de aplicarlos a producción.

## Ajustes del backend

- [x] **Proyecto y región de Supabase:** `flores_systems` / `shonvjevhinvllfjndbq`, `us-east-1`.
- [ ] **Cuenta de Anthony y registro de administradores:** ____________________
- [ ] **Proveedor, dominio remitente y credenciales disponibles:** ____________________
- [ ] **Límite inicial de envíos y almacenamiento:** preparado en PostgreSQL, 5 envíos por IP y ventana fija de 15 minutos; activación pendiente.
- [ ] **Cadencia y máximo de reintentos:** Cron cada minuto preparado; 5 intentos, backoff y corte a las 20 horas; falta habilitarlo con secretos.
- [ ] **Respaldo y conservación:** ____________________
- [ ] **Plan gratuito o de pago para la captación real:** ____________________
- [ ] **Proveedor y número remitente de WhatsApp, si se activa:** ____________________

