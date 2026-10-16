# Operación del backend de Flores Systems

Estado comprobado el 15/10/2026. La captación pública permanece deshabilitada hasta completar las credenciales, el correo, la cuenta administradora y la revisión de privacidad. El frontend y la publicación del sitio siguen su propio plan.

## Entorno aplicado

| Componente | Estado |
| --- | --- |
| Proyecto | `flores_systems`, `shonvjevhinvllfjndbq`, `us-east-1` |
| PostgreSQL | 17.11; release gestionada 17.11.0.003 |
| Migraciones remotas y locales | `20261015223054_backend_foundation`, `20261015224108_notification_references` |
| Tablas | `admin_users`, `quote_requests`, `notification_jobs`, `request_notes`, `request_status_history`; límite en `private.rate_limits` |
| Edge Function | `send-notifications`, versión 1, ACTIVE; valida su secreto privado antes de acceder a la cola |
| Extensiones instaladas relevantes | pgcrypto 1.3, supabase_vault 0.3.1, pg_stat_statements 1.11 |
| Disponibles sin activar | pg_cron 1.6.4, pg_net 0.20.4, pg_trgm 1.6 |
| Desarrollo verificado | Node 24.17.0; rama requerida 24; `.nvmrc` propone 24.21.0 según la matriz |
| Hosting | Pendiente; registrar el parche efectivo de Node al elegirlo |

El esquema usa migraciones SQL imperativas. Los nombres locales coinciden con las versiones asignadas por MCP. No volver a aplicar la migración inicial mediante otro timestamp. Los tipos de `database.types.ts` proceden del esquema remoto mediante MCP; regenerarlos después de cambios estructurales. El generador PGlite es una ayuda local y no sustituye la generación oficial de relaciones de Supabase.

## Activación

1. Completar `.env.local`, ignorado por Git. Ya contiene la URL, la clave publishable y secretos aleatorios independientes para HMAC y Cron. Faltan `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `NOTIFICATION_FROM`, `TRUSTED_IP_HEADER`, `ADMIN_EMAIL` y el `APP_URL` definitivo. No copiar claves secret a variables `NEXT_PUBLIC_`.
2. En Supabase Auth, desactivar **Allow new users to sign up**. La comprobación pública de configuración todavía devuelve `disable_signup=false`; el `config.toml` local no modifica por sí solo el servicio alojado.
3. Definir Site URL y los retornos exactos `/auth/callback` y `/auth/confirm`. Configurar SMTP propio, dominio remitente verificado y DNS de Resend. El SMTP predeterminado de Supabase no es adecuado para la publicación. [Configuración oficial de SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
4. Configurar las plantillas de recuperación e invitación para SSR con enlaces `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery` y `type=invite`, respectivamente. `/auth/callback` admite el intercambio PKCE; no acepta redirecciones arbitrarias.
5. Confirmar `ADMIN_EMAIL` para Anthony. Si su usuario ya existe, ejecutar `npm run backend:admin`. Para invitarlo expresamente, después de configurar SMTP y la plantilla, usar `npm run backend:admin -- --invite`. El script comprueba proyecto, registro público cerrado y email antes de dar acceso por UUID. No usa metadata editable para autorizar.
6. Configurar `RESEND_API_KEY` y `NOTIFICATION_CRON_SECRET` en los secretos de Edge Functions del proyecto. El segundo debe coincidir con el secreto local. El runtime suministra `SUPABASE_URL` y sus claves secret de servidor; no publicar ni devolver esas claves desde una función.
7. Guardar el mismo secreto Cron en Supabase Vault con nombre `flores_notification_cron_secret`. Ejecutar `supabase/operations/enable-notifications.sql`: instala Cron/pg_net si faltan y programa cada minuto. El SQL versionado no contiene el valor del secreto. [Programación oficial](https://supabase.com/docs/guides/functions/schedule-functions).
8. Configurar un encabezado de IP que el hosting sobrescriba y cuya procedencia se haya comprobado. No confiar directamente en un `x-forwarded-for` enviado por el navegador. Ejecutar `npm run backend:check -- --production` y completar sus pendientes.
9. Habilitar `QUOTE_RATE_LIMIT_ENABLED=true` solamente en el entorno listo para recepción. Probar una solicitud, su aviso real y el seguimiento autenticado antes de publicar.

La autenticación de la función es propia: `verify_jwt=false` permite usar la credencial privada de Cron; la función valida `x-cron-secret` mediante comparación constante y rechaza claves publishable como secreto esperado. Sin configuración devuelve 503 y no reclama trabajos. GET devuelve 405.

Si se utiliza CLI para subir secretos, la ayuda comprobada admite `npm exec supabase -- secrets set --project-ref shonvjevhinvllfjndbq --env-file <archivo-privado>`. Ese archivo debe contener solo los secretos de Edge, estar fuera de Git y no incluir nombres reservados `SUPABASE_`. La CLI requiere un token personal acotado al proyecto; el acceso MCP no implica que la CLI esté autenticada. También se pueden configurar desde el dashboard.

## Atención diaria y recuperación de avisos

Consultar oportunidades nuevas y seguimientos vencidos en el panel. Los cambios de estado no representan progreso del desarrollo; cerrar requiere resultado, y reabrir conserva el historial. Una respuesta de conflicto de versión requiere recargar y revisar, no repetir sobrescribiendo.

La cola usa 5 intentos, espera creciente desde 60 segundos, lotes de 5 y bloqueos de 3 minutos con token de propiedad. El contenido del correo queda congelado en el commit, incluida la referencia y el enlace privado. Solo el trabajador que conserva el bloqueo puede confirmar el resultado.

`accepted` significa que Resend aceptó el correo, no que llegó a bandeja de entrada. Los reintentos usan una clave estable por aviso. El proveedor conserva esas claves 24 horas; el backend corta automáticamente a las 20 horas desde el primer intento. [Idempotencia de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).

Para un aviso `exhausted` dentro de esas 20 horas, el administrador puede reencolarlo desde el panel. Fuera de la ventana, revisar primero los logs de Resend para reconciliar una posible aceptación: no borrar el aviso, cambiar su ID ni forzar reenvíos sin resolver la ambigüedad. Las solicitudes se conservan aunque falle el correo.

`supabase/operations/health.sql` consulta contadores y fallos de Cron sin devolver datos del contacto. Antes de configurar Cron, ejecutar solo las consultas de la cola. Vigilar avisos pendientes durante más de dos minutos, agotados y bloqueos vencidos; definir un destino de alertas operativo al elegir el servicio de monitoreo. No registrar direcciones, notas, cuerpos ni tokens.

El límite inicial preparado es PostgreSQL: 5 envíos por IP y ventana fija de 15 minutos. Se conserva solo un HMAC de la IP; la tarea diaria elimina ventanas de más de dos días y logs de Cron de más de siete días. No se instaló Redis ni Upstash.

## Respaldo y conservación

Antes de captar clientes, elegir respaldo gestionado o exportaciones privadas, definir responsable y destino cifrado, y probar la restauración en un proyecto separado. El CLI necesita Docker y acceso a la base; aquí Docker no estaba iniciado y no hay contraseña de base disponible. No se ejecutó una restauración remota ni se contrató un plan de pago.

La [guía oficial de respaldo/restauración](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) cubre dumps de roles, esquema y datos, historial de migraciones y pasos adicionales al restaurar en otro proyecto, incluida la clave de cifrado raíz. Seguirla al preparar la restauración; no considerar que copiar las tablas públicas recupere Auth y sus dependencias. `backups/` y `*.dump` están ignorados por Git, pero el cifrado y el almacenamiento externo se configuran aparte.

Propuesta para decidir: RPO de 24 horas y RTO de 4 horas, ajustados al plan contratado; no son garantías actuales. La retención de contactos, las solicitudes de acceso/corrección/eliminación y el tratamiento de respaldos requieren la decisión de privacidad pendiente. La primera versión del CRM no permite eliminación definitiva desde el panel.

Para recuperar una cuenta, usar el flujo SMTP y revocar las sesiones de actualización correspondientes; un JWT de acceso emitido puede seguir válido hasta expirar. Al rotar el secreto Cron, pausar el trabajo, actualizar Edge y Vault conjuntamente y reactivarlo. Mantener intactos IDs y payloads de avisos pendientes.

## Evidencia y límites

Última validación del 15/10/2026: **46 pruebas en 8 archivos**, tipos de servidor y Edge, tipos de la aplicación, lint y compilación de producción completados correctamente. La comprobación de configuración permanece pendiente por credenciales, remitente y encabezado de IP; esa comprobación no habilita la recepción automáticamente.

- Pruebas locales sobre PostgreSQL PGlite: atomicidad, idempotencia, cuota compartida, RLS, cuentas sin privilegios, estado/historial, notas inmutables, conflictos de versión y recuperación de bloqueos.
- Verificación en PostgreSQL 17.11 alojado con `supabase/verification/backend-smoke.sql`: transacción de prueba revertida; solicitud/aviso, referencia, duplicación, conflicto y permisos comprobados. No se conservaron contactos de prueba.
- Tipos del backend y Edge comprobados, lint y compilación Next.js ejecutados. El informe final registra la última ejecución del repositorio.
- Asesores: solo información sobre RLS deliberadamente sin políticas en `private.rate_limits` (servicio con bypass) e índices recién creados sin uso; no se ampliaron permisos para eliminar ese aviso. [Explicación del asesor RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Auditoría npm de dependencias de producción: sin vulnerabilidades reportadas. El conjunto de lint de desarrollo conserva cinco avisos altos derivados de `braces <=3.0.3`; la versión estable consultada no ofrece corrección compatible. No se aplicó un downgrade forzado de Next.js.
- Pendientes reales: cuenta administradora y prueba de sesión/recuperación, registro público desactivado, proveedor/DNS/SMTP, correo recibido, programación habilitada, hosting, alertas, restauración y privacidad.
