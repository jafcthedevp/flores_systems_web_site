# Plan frontend — Flores Systems

**Estado:** frontend implementado; integración operativa y publicación pendientes. Actualización del 15 de octubre de 2026.  
**Objetivo:** convertir la landing actual en la interfaz de captación y seguimiento de Flores Systems.  
**Documentos relacionados:** [plan maestro](PLAN_IMPLEMENTACION.md), [backend](PLAN_BACKEND.md), [versiones](VERSIONES_TECNOLOGIAS.md).

Este plan cubre pantallas, componentes, navegación e interacción. La validación definitiva, las sesiones y la persistencia se detallan en el backend. Ambos forman parte de una aplicación Next.js.

## Estado de ejecución

La landing se migró a Next.js conservando los originales como referencia en `/referencia`. Se construyeron tres demos básicas propias porque el repositorio no contiene fuentes de demos comerciales anteriores ni enlaces para inventariarlas. El formulario y las pantallas administrativas consumen el contrato y las acciones de la sesión de backend; no se cambió el esquema ni se ejecutaron operaciones sobre el proyecto remoto desde frontend.

| Fase | Resultado implementado | Pendiente para cierre operativo |
| --- | --- | --- |
| FE-0 | App Router, TypeScript estricto, componentes de servidor, imágenes, fuentes, errores y Open Graph | Revisión del dominio definitivo |
| FE-1 | Tienda, veterinaria y restaurante con interacciones locales y datos ficticios | Comparar con fuentes anteriores si se proporcionan; URL de agenda |
| FE-2 | Formulario integrado con BE-1, validación compartida, referencia confirmada y errores recuperables | Verificar guardado y aviso reales con backend configurado |
| FE-3 | Lista, filtros, notas, estados, seguimiento, avisos y registro manual conectados a operaciones autorizadas | Prueba con cuenta administradora y persistencia real al recargar |
| FE-4 | Navegación móvil y teclado, eventos sin datos personales, metadatos y pruebas | Proveedor de analítica, privacidad definitiva y publicación |
| FE-5 | Órbitas CSS con texto derecho y alternativa estática; marquee con pausa | Activado; verificar visualmente en el dominio publicado |

Las casillas marcadas representan implementación de interfaz; no certifican entrega de correos ni configuración de servicios externos. Instrucciones y puntos de integración en [FRONTEND_INTEGRACION.md](FRONTEND_INTEGRACION.md).

## Referencia visual y prioridades

La implementación debe tomar como referencia `index.html`, `styles.css`, `script.js` y las imágenes de `img/`.

- Mantener la identidad de Flores Systems, la flor azul, la paleta tecnológica y las secciones actuales.
- Conservar el marquee de tarjetas con frases dentro de cada tarjeta, sin imágenes de rosas ni etiquetas de sectores.
- Mantener el desplazamiento continuo del marquee y el comportamiento para movimiento reducido.
- Incorporar el formulario en la sección de contacto y orientar los botones principales hacia él.
- Mantener WhatsApp y correo como vías de contacto directo.
- Reservar una mejora visual para los mensajes alrededor de la flor: trayectorias elípticas, similares a electrones alrededor de un átomo, con texto legible durante todo el recorrido.
- Respetar la preferencia de movimiento reducido y adaptar las órbitas a móvil.
- Usar un estilo claro y práctico en el panel administrativo, con énfasis en contactos, estados y notas.

Las órbitas del logo se implementarán después de asegurar la recepción y el seguimiento de solicitudes. Los comentarios existentes del HTML deben trasladarse a los componentes correspondientes al migrar.

## FE-0 — Base Next.js y migración de la landing

**Objetivo:** crear una base pequeña y mantenible para agregar el formulario.

- [x] Crear el proyecto con Next.js estable, TypeScript y App Router.
- [x] Instalar las versiones exactas de [matriz compartida](VERSIONES_TECNOLOGIAS.md) y conservar el archivo de bloqueo de dependencias.
- [x] Dividir la landing en componentes: cabecera, hero, marquee, soluciones, sectores, demos, nosotros y contacto.
- [x] Trasladar las imágenes transparentes `*_nobg.png` a `public/img/`.
- [x] Mantener el CSS existente; usar estilos locales cuando faciliten el mantenimiento.
- [x] Renderizar contenido estático con Server Components; limitar Client Components al menú, formulario e interacciones.
- [x] Adaptar imágenes con `next/image`, fuentes con `next/font` y metadatos de la marca, incluidas las etiquetas Open Graph (título, descripción e imagen) para que el enlace se vea bien al compartirlo por WhatsApp.
- [x] Adaptar las interacciones de `script.js` al ciclo de vida de React.
- [x] Preparar estados de carga, error y página no encontrada.
- [x] Conservar una referencia del diseño actual para revisar la migración.

**Criterio de cierre:** la landing conserva su apariencia y navegación en escritorio y móvil, y el proyecto compila sin errores.

**Criterios técnicos de la migración**

- [x] Configurar TypeScript estricto y las versiones compatibles de la matriz.
- [x] Usar CSS de la landing y estilos locales; una nueva biblioteca visual requiere una necesidad concreta.
- [x] Evitar convertir toda la página en Client Component por el formulario o las animaciones.
- [x] Mantener las lecturas de datos del panel en Server Components que invoquen la capa autorizada del backend.
- [x] Usar `proxy.ts` si la integración SSR de la versión elegida lo requiere; las comprobaciones de acceso siguen en las operaciones del servidor.
- [x] No poner credenciales secretas en componentes ni variables `NEXT_PUBLIC_`.
- [x] Separar tipos y validaciones compartibles de los módulos exclusivos del servidor.

## FE-1 — Demos por rubro y puntos de contacto

**Objetivo:** mostrar las experiencias disponibles para los rubros con prospección activa.

- [ ] Inventariar fuentes, diseños y comportamiento de las demos de tienda, veterinaria y restaurante.
- [ ] Confirmar acceso a los enlaces existentes sin sesión y obtener su fuente cuando no esté en el repositorio.
- [x] Crear rutas propuestas `/demos/tienda`, `/demos/veterinaria` y `/demos/restaurante`.
- [x] Usar datos de ejemplo y aclarar que se trata de demostraciones.
- [x] No conectar estas demos a expedientes, pedidos o clientes reales.
- [x] Enlazar las demos desde la landing y volver desde cada demo a solicitar cotización.
- [x] Priorizar veterinarias, restaurantes, abarrotes/bodegas y mercados/puestos en la presentación; conservar los otros sectores como opciones.
- [x] Unificar el nombre público en landing, demos y textos compartidos.
- [x] Mantener los enlaces directos de WhatsApp y correo.
- [ ] Añadir un enlace secundario a Cal.com cuando Anthony confirme su URL; abrir un enlace de agenda no crea una solicitud en el CRM.
- [ ] Evaluar precios “desde” solo después de definir alcance y condiciones.

**Dependencia:** disponer de las fuentes o definir la reconstrucción de cada demo. Las demos no disponibles se planifican aparte para no detener la captación.

**Criterio de cierre:** rutas de demo públicas, datos ficticios y retorno claro al contacto. Una demo faltante no debe presentarse como terminada.

## FE-2 — Interfaz del formulario e integración

**Objetivo:** permitir solicitudes claras, breves y recuperables ante errores.

**Experiencia del visitante**

- [x] Agregar “Solicitar cotización” en la sección de contacto.
- [ ] Ofrecer junto al formulario un enlace secundario para agendar una llamada corta (por ejemplo con Cal.com), para quien prefiere hablar antes de escribir.
- [x] Mostrar campos cortos, etiquetas claras y errores junto al campo.
- [x] Mostrar estado de envío y evitar envíos repetidos mientras se procesa.
- [x] Confirmar la recepción únicamente después de guardar la solicitud.
- [x] Conservar los datos escritos si falla el guardado y permitir reintentar.
- [x] Aclarar que se solicita una propuesta; el precio se define después de conversar.
- [x] Mostrar una explicación breve del uso de los datos y el aviso de privacidad.

Los campos y catálogos se definen en el [contrato compartido del plan maestro](PLAN_IMPLEMENTACION.md#2-contrato-compartido-del-formulario-y-el-crm). No duplicar otra lista de campos con reglas diferentes en este documento.

- [x] Validar en cliente para dar respuestas inmediatas; usar el esquema compartido y mantener la validación de servidor.
- [x] Exigir el dato de contacto correspondiente al canal elegido.
- [x] Mostrar “Aún no lo sé” para el presupuesto opcional.
- [x] Mantener una clave por envío lógico y reutilizarla al reintentar.
- [x] Impedir doble clic durante el envío, además de la idempotencia del backend.
- [x] Conectar el formulario con la Server Action de BE-1.
- [x] Distinguir error de campo, límite de envíos, fallo temporal y éxito.
- [x] No mostrar éxito por un clic ni por el inicio del aviso: esperar confirmación de guardado.
- [x] Evitar que un fallo posterior de analítica convierta un guardado correcto en un error visible.
- [x] Tras éxito, mostrar referencia y siguiente paso; no prometer tiempos de respuesta no acordados.
- [x] Conservar el enlace de WhatsApp para quien prefiera contacto directo y explicar internamente que esos contactos se registran manualmente.

**Puede comenzar:** con el contrato y respuestas ficticias.  
**Depende para funcionar:** BE-1; para avisos reales, BE-2.  
**Criterio de cierre:** guardado confirmado, errores recuperables y correo verificable en la integración; pruebas de móvil y teclado.

## FE-3 — Pantallas del mini CRM

**Objetivo:** que Anthony vea y atienda oportunidades desde su cuenta.

**Acceso y navegación**

- [x] Crear `/admin/login`, recuperación y restablecimiento de contraseña.
- [x] Añadir estados de sesión, acceso denegado y salida.
- [x] Evitar mostrar datos privados brevemente antes de redirigir al visitante sin acceso.
- [x] Mostrar mensajes de recuperación sin revelar si una cuenta ajena existe.
- [x] No confundir ocultar botones o enlaces con autorizar operaciones: BE-3 controla cada acceso.
- [x] Adaptar la lista y el detalle a móvil sin depender de una tabla ancha.

**Pantallas y acciones**

- [x] Lista paginada con nombre, negocio, servicio, fecha y estado.
- [x] Búsqueda por contacto, negocio, correo o teléfono.
- [x] Filtros por estado y fecha, con solicitudes recientes primero.
- [x] Detalle con los datos completos de la solicitud.
- [x] Cambio de estado con historial de fecha y autor.
- [x] Notas internas con fecha y autor; inicialmente permitir agregar, sin edición destructiva.
- [x] Próxima fecha de seguimiento y listado de pendientes.
- [x] Botones para abrir WhatsApp o redactar un correo al contacto.
- [x] Mostrar avisos pendientes o fallidos y permitir reintentarlos.
- [x] Crear solicitudes manuales para contactos recibidos por WhatsApp, correo o prospección, indicando su origen para saber qué canal trae más oportunidades.
- [x] Mostrar contadores sencillos por estado y pendientes de seguimiento.

- [x] Usar las etiquetas y resultados de cierre del contrato compartido.
- [x] Mostrar cierre y reapertura conservando el historial.
- [x] Mantener notas internas diferenciadas de mensajes al cliente.
- [x] Mostrar la próxima fecha de seguimiento con zona `America/Lima`.
- [x] Pedir al backend paginación y filtros; no descargar toda la base al navegador.
- [x] Mostrar resultados confirmados de las mutaciones o revertir cambios optimistas si fallan.
- [x] Abrir WhatsApp/correo sin modificar automáticamente el estado comercial.
- [x] Distinguir “aceptado por el proveedor” de una entrega confirmada cuando haya datos de entrega.

**Depende de:** BE-3 para sesión, consultas, notas, estados y seguimiento; BE-2 para estado de avisos.

**Criterio de cierre:** Anthony puede completar el flujo de seguimiento; usuarios no autorizados no reciben datos del panel.

## FE-4 — Accesibilidad, analítica y publicación

- [ ] Revisar escritorio, móvil, teclado, foco visible, errores y estados vacíos.
- [ ] Revisar Open Graph, título, descripción e imagen al compartir por WhatsApp.
- [ ] Configurar URL definitiva, página de privacidad y enlaces de contacto.
- [ ] Elegir analítica simple; no transmitir nombres, teléfonos, correos ni descripciones del formulario en eventos o URLs.
- [x] Diferenciar visita, clic de demo, clic de agenda, inicio de formulario y solicitud guardada.
- [x] Emitir conversión solo después de la confirmación del backend; usar la base de datos como referencia de solicitudes reales.
- [x] Aclarar que un clic en agenda no demuestra una reserva.
- [x] Revisar que los datos de demostración no se mezclen con contactos reales.
- [x] Ejecutar compilación, comprobación de tipos, lint y pruebas significativas del flujo crítico antes de publicar (flujo local; integración real pendiente).
- [ ] Publicar junto a los controles aplicables de BE-4 y revisar una solicitud de prueba completa.

**Criterio de cierre:** experiencia utilizable y flujo completo verificado, sin datos privados en analítica.

## FE-5 — Refinamiento visual y órbitas del logo

**Objetivo:** desarrollar las ideas visuales anotadas sin retrasar la captación.

- [x] Revisar que el marquee actual se vea y se desplace correctamente en los dispositivos objetivo.
- [x] Animar los mensajes del hero sobre órbitas elípticas alrededor de la flor (activación pendiente de captación/CRM).
- [x] Mantener los textos derechos durante la órbita, con velocidades y posiciones iniciales diferentes.
- [x] Evitar que los mensajes tapen llamados a la acción o salgan del área visible.
- [x] Definir posiciones estáticas legibles cuando se solicite movimiento reducido.
- [x] Priorizar CSS para estos movimientos y evaluar bibliotecas solo si una interacción lo necesita.
- [x] Revisar que las animaciones no perjudiquen la carga, la lectura ni el uso del formulario (revisión local; activación pública pendiente).

**Criterio de cierre:** efecto de átomo visible y legible, adaptado a móvil, con alternativa estática.

## Organización orientativa de la interfaz

```text
src/app/
  page.tsx
  demos/tienda/page.tsx
  demos/veterinaria/page.tsx
  demos/restaurante/page.tsx
  admin/login/page.tsx
  admin/recuperar/page.tsx
  admin/restablecer/page.tsx
  admin/(protected)/layout.tsx
  admin/(protected)/page.tsx
  admin/(protected)/solicitudes/page.tsx
  admin/(protected)/solicitudes/[id]/page.tsx
src/components/
  landing/
  demos/
  quote-form/
  admin/
public/img/
```

Los archivos `page.tsx` del panel pueden renderizar en servidor: su consulta debe pasar por la capa de acceso autorizada descrita en el backend. El reparto de carpetas no cambia esa responsabilidad.

## Verificaciones previstas

- [x] La apariencia y los enlaces de la landing se conservan al migrar.
- [x] El formulario funciona con campos condicionales y conserva información ante errores.
- [ ] Un envío duplicado muestra la misma referencia sin generar otro contacto.
- [ ] El panel maneja lista vacía, búsquedas sin resultado y errores de conexión.
- [ ] Notas y estados reflejan lo persistido al recargar.
- [x] Las demos funcionan con datos ficticios y sin sesión externa.
- [x] Marquee y órbitas tienen alternativas para movimiento reducido.
- [x] No existen módulos privilegiados del backend en el paquete del navegador.

La aplicación Next.js ya existe y se compila. Las verificaciones de persistencia, correo y sesión real deben completarse junto a backend antes de publicar; las pruebas de frontend usan datos ficticios y recepción deshabilitada.

## Ajustes del frontend

- [ ] **Cambios de textos o secciones:** ____________________
- [ ] **Fuentes y alcance de las tres demos:** ____________________
- [ ] **Nombre público y rubros prioritarios:** ____________________
- [ ] **Precios “desde”:** ____________________
- [ ] **URL de agenda:** ____________________
- [ ] **Proveedor de analítica:** ____________________
- [ ] **Prioridad de las animaciones después del CRM:** ____________________

