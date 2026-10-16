# Frontend de Flores Systems

Aplicación Next.js 16.4.1 con React 19.3.1, TypeScript estricto y el CSS de la landing original. La guía de diseño se aplicó para conservar la flor azul, la paleta y las secciones; las guías de Next.js/React mantienen el contenido estático en servidor y limitan el JavaScript a interacciones.

## Ejecutar

```powershell
npm ci
npm run dev
```

Abrir `http://localhost:3000`. La versión propuesta de Node está en `.nvmrc`; la implementación se verificó con Node 24.17.0 y npm 11.13.0 de este equipo. No se cambió el Node global del usuario.

Combinar las variables de `.env.example` (backend) y `.env.frontend.example` (interfaz) en `.env.local`, sin subir secretos. El formulario usa el backend existente y conserva sus datos si este todavía no está habilitado. El aviso de privacidad es un borrador y la captación real requiere terminar esa revisión.

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Landing y formulario de cotización |
| `/demos/tienda` | Catálogo, carrito y venta simulada |
| `/demos/veterinaria` | Búsqueda de mascotas y estado de citas ficticias |
| `/demos/restaurante` | Carta, carrito y pedido simulado |
| `/admin/login` | Acceso del backend con botones de estado de envío |
| `/admin/recuperar`, `/admin/restablecer` | Recuperación y nueva contraseña mediante acciones de backend |
| `/admin/solicitudes` | Lista paginada en servidor y filtros de contacto, estado y fecha |
| `/admin/solicitudes/[id]` | Detalle, notas, historial, cierre, cotización, seguimiento y avisos |
| `/admin/solicitudes/nueva` | Registro manual con origen del contacto |
| `/admin/vista-previa` | Contadores de ejemplo, solo desarrollo con `FRONTEND_PREVIEW=true` |
| `/referencia` | HTML original conservado y excluido de indexación |
| `/privacidad` | Aviso provisional que requiere completar información antes de publicar |

La vista previa administrativa utiliza exclusivamente datos ficticios, no hace llamadas de escritura y se desactiva siempre en producción. Sus cambios desaparecen al recargar. Las demos no usan la base de datos ni envían pedidos, cobros o mensajes.

## Verificar

```powershell
npm test
npm run lint
npm run build
npm run typecheck
npm run test:e2e
npm exec playwright test -- --config playwright.preview.config.ts
```

Las pruebas de navegador usan Edge en Windows; en otros sistemas, instalar Chromium con `npm exec playwright install chromium`. Se puede elegir otro canal instalado con `PLAYWRIGHT_CHANNEL`. Las capturas y trazas se guardan en `test-results/` y se excluyen de Git. El servidor de pruebas desactiva la recepción y las claves de Supabase; no genera contactos reales.

La prueba de vista previa usa el puerto 3101 y `.next-frontend-preview/` para no interferir con el servidor de desarrollo del agente de backend. Las pruebas de producción usan el puerto 3100 y requieren una compilación previa.

## Integración y decisiones pendientes

- Contratos compartidos: `src/lib/contracts/quote-requests.ts`; el adaptador de interfaz añade etiquetas públicas y traduce los nombres de campo, sin duplicar reglas.
- La recepción de solicitudes se conecta con `submitQuoteRequest`; el éxito requiere una referencia confirmada. Los reintentos conservan la clave mientras no cambien los datos del envío.
- Las consultas y mutaciones del CRM requieren la autorización de backend. El frontend no usa una clave privilegiada en el navegador ni modifica tablas, políticas o funciones SQL.
- La fecha del seguimiento usa `America/Lima`; los controles de fecha/hora se convierten con el desplazamiento de Lima antes de enviarse.
- WhatsApp y correo abren el canal elegido sin cambiar estados. Los contactos recibidos por esos medios se registran manualmente.
- `NEXT_PUBLIC_BOOKING_URL` muestra un enlace de Cal.com solo cuando hay una URL válida. El clic no crea una solicitud ni demuestra una reserva.
- La analítica emite eventos locales `flores:analytics` con un único nombre de evento. No hay proveedor, cookies de analítica, datos personales ni transmisión externa. Elegir el proveedor antes de activarlo.
- Las frases alrededor de la flor orbitan de forma predeterminada. Movimiento reducido mantiene las etiquetas estáticas.
- Los originales `index.html`, `styles.css`, `script.js` e `img/` permanecen como referencia. `scripts/migrate-landing.mjs` fue un paso de migración inicial; no volver a ejecutarlo sobre componentes ya editados.
- Completar dominio, aviso de privacidad, agenda y la prueba con cuenta real que confirme guardado, correo y persistencia tras recargar. No se publicó ni modificó el proyecto remoto desde la sesión de frontend.

La auditoría de producción no detectó vulnerabilidades. La instalación completa reporta cinco alertas altas de desarrollo en la cadena ESLint → fast-glob → micromatch → braces; npm no ofrece una actualización compatible y propone bajar Next ESLint a otra rama. Se conserva la matriz exacta y se registra el hallazgo para seguimiento, sin ejecutar `audit fix --force`.

## Resultado de verificación local — 15 de octubre de 2026

- Compilación de producción, TypeScript y lint correctos.
- 42 pruebas automatizadas del repositorio correctas, incluidas 12 del contrato/adaptador de frontend.
- 7 pruebas de navegador sobre producción correctas: navegación móvil, validación y conservación de datos, reintento con la misma clave, tres demos, bloqueo sin sesión y Open Graph.
- 2 pruebas de vista previa correctas: CRM en móvil (búsqueda, vacío, nota, cierre y reapertura) y órbitas dentro del hero con texto derecho y movimiento reducido. Se repitió la prueba de órbitas después de ajustar su tamaño de texto.
- Capturas de escritorio, móvil y CRM inspeccionadas. Las pruebas usan Edge instalado en este equipo.
- `npm audit --omit=dev`: cero vulnerabilidades. Las alertas de desarrollo indicadas arriba siguen pendientes.
- No se verificó un envío real con correo ni una sesión administradora real; esos criterios permanecen abiertos en el plan.
