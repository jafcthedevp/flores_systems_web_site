# Versiones y compatibilidad — Flores Systems

**Consulta:** 15 de octubre de 2026, aproximadamente 04:51–05:00 UTC.  
**Estado:** versiones propuestas para la planificación; no instaladas ni verificadas mediante una compilación del proyecto.  
**Planes:** [maestro](PLAN_IMPLEMENTACION.md), [frontend](PLAN_FRONTEND.md), [backend](PLAN_BACKEND.md).

## Criterio de selección

Se consultaron los metadatos del registro oficial de npm: etiqueta `latest`, versiones publicadas, fechas, `engines` y `peerDependencies`. Para Node.js, Git y PostgreSQL se consultaron sus publicaciones oficiales.

- “Última estable” significa la versión marcada como `latest` al consultar. No se seleccionan beta, RC, canary ni next.
- “Base propuesta” es la versión a fijar si se inicia con estas decisiones.
- Se conserva tu criterio de al menos 14 días para actualizaciones ordinarias. Las bases anteriores se mantienen cuando cumplen antigüedad y requisitos declarados.
- Las correcciones de seguridad tienen prioridad sobre esa espera. La excepción debe quedar documentada y pasar los controles de integración.
- La compatibilidad que se registra aquí es la declarada por los paquetes. La compilación, el lint y las pruebas del proyecto siguen pendientes.
- Volver a consultar las fuentes antes de instalar o publicar. No interpretar esta tabla como autorización para actualizar automáticamente dependencias.

## Hallazgo de seguridad que cambia la base de Next.js

La versión 16.4.1 de Next.js incluye correcciones críticas y de alta severidad. Se propone sustituir la base anterior 16.3.8 por 16.4.1 sin esperar 14 días. Alinear `eslint-config-next` y revisar React/React DOM como conjunto; la pareja propuesta es 19.3.1.

La excepción se justifica en el parche de Next.js. La publicación de React describe mejoras del protocolo de Server Components; no se atribuye a ese texto un aviso de seguridad que no expresa. [Release de Next.js 16.4.1](https://github.com/vercel/next.js/releases/tag/v16.4.1), [release de React 19.3.1](https://github.com/react/react/releases/tag/v19.3.1).

## Paquetes de aplicación y herramientas

Las fechas son de publicación de la última estable, en UTC. Cada enlace del paquete permite repetir la consulta. La antigüedad mínima puede hacer que la base propuesta sea anterior a la última estable.

| Paquete | Base anterior | Última estable y publicación | Base propuesta | Motivo |
| --- | --- | --- | --- | --- |
| [next](https://registry.npmjs.org/next/latest) | 16.3.8 | 16.4.1 · 2026-10-14 | **16.4.1** | Excepción por correcciones de seguridad |
| [react](https://registry.npmjs.org/react/latest) | 19.3.0 | 19.3.1 · 2026-10-14 | **19.3.1** | Actualización coordinada con el conjunto Next.js; excepción explícita a los 14 días |
| [react-dom](https://registry.npmjs.org/react-dom/latest) | 19.3.0 | 19.3.1 · 2026-10-14 | **19.3.1** | Mantener la misma versión que React |
| [typescript](https://registry.npmjs.org/typescript/latest) | 6.0.3 | 7.0.2 · 2026-07-08 | **6.0.3** | El linter elegido aún declara TypeScript menor a 6.1 |
| [@supabase/supabase-js](https://registry.npmjs.org/@supabase/supabase-js/latest) | 2.117.2 | 2.117.3 · 2026-10-07 | **2.117.2** | Mantener base publicada el 2026-09-25; candidata reciente pendiente de antigüedad |
| [@supabase/ssr](https://registry.npmjs.org/@supabase/ssr/latest) | 0.12.7 | 0.12.7 · 2026-09-08 | **0.12.7** | Ya coincide con latest y cumple antigüedad |
| [zod](https://registry.npmjs.org/zod/latest) | 4.6.5 | 4.6.7 · 2026-10-12 | **4.6.5** | Mantener base del 2026-09-13 por criterio de 14 días |
| [resend](https://registry.npmjs.org/resend/latest) | 6.31.0 | 6.33.0 · 2026-10-14 | **6.31.0** | Mantener base del 2026-09-29 por criterio de 14 días |
| [supabase — CLI](https://registry.npmjs.org/supabase/latest) | Sin fijar | 2.121.0 · 2026-10-14 | **2.119.0** | Versión estable publicada el 2026-09-30, elegible por antigüedad |
| [vitest](https://registry.npmjs.org/vitest/latest) | 5.0.3 | 5.0.4 · 2026-10-12 | **5.0.3** | Base del 2026-09-30; adoptar al incorporar pruebas de lógica |
| [@playwright/test](https://registry.npmjs.org/@playwright/test/latest) | 1.63.0 | 1.64.1 · 2026-10-14 | **1.63.0** | Base del 2026-09-04; pruebas del flujo integrado |
| [eslint](https://registry.npmjs.org/eslint/latest) | 9.39.5 | 10.12.0 · 2026-10-02 | **9.39.5** | Restricciones de los plugins de React, import y accesibilidad |
| [eslint-config-next](https://registry.npmjs.org/eslint-config-next/latest) | 16.3.8 | 16.4.1 · 2026-10-14 | **16.4.1** | Alinear con la versión propuesta de Next.js |
| [prettier](https://registry.npmjs.org/prettier/latest) | 3.9.9 | 3.9.10 · 2026-10-10 | **3.9.9** | Mantener base del 2026-09-23 por criterio de 14 días |
| [@types/node](https://registry.npmjs.org/@types/node/latest) | 24.19.0 | 26.6.5 · 2026-10-09 | **24.19.0** | Tipos de la rama 24 para Node 24; última consultada en esa rama: 24.19.2 |
| [@types/react](https://registry.npmjs.org/@types/react/latest) | 19.3.0 | 19.3.0 · 2026-09-09 | **19.3.0** | Rama de tipos correspondiente al runtime |
| [@types/react-dom](https://registry.npmjs.org/@types/react-dom/latest) | 19.3.0 | 19.3.0 · 2026-09-09 | **19.3.0** | Pareja de tipos y peer de React compatibles |

La base es una propuesta documental. Las diferencias frente a latest se conservan deliberadamente por las decisiones previas del plan; no son versiones declaradas como “las más nuevas”.

## Entorno, gestores de paquetes y PostgreSQL

| Tecnología | Última consultada | Base o decisión para el proyecto | Fuente |
| --- | --- | --- | --- |
| Node.js Current | 26.12.0 | Registrar como Current; usar una rama LTS para producción | [Calendario oficial](https://nodejs.org/en/about/previous-releases) |
| Node.js LTS | 24.22.0, publicado el 2026-10-14 | **24.21.0** para desarrollo reproducible con la espera vigente; reevaluar 24.22.0 al implementar o ante un aviso de seguridad | [Índice oficial de releases](https://nodejs.org/dist/index.json), [release LTS](https://nodejs.org/en/blog/release/v24.22.0) |
| npm | 12.2.0 | Sigue pendiente elegir gestor; Node 24.21.0 incluye npm **11.19.0**, que sirve como base si se elige npm | [Registro npm](https://registry.npmjs.org/npm/latest), [índice de Node](https://nodejs.org/dist/index.json) |
| pnpm | 12.11.2 | Alternativa pendiente; no añadir un segundo archivo de bloqueo | [Registro pnpm](https://registry.npmjs.org/pnpm/latest) |
| Git | 2.56.0 | Herramienta de desarrollo; no dependencia del sitio | [Publicación oficial](https://git-scm.com/) |
| PostgreSQL upstream | 18.6 en la tabla estable consultada | **Pendiente del proyecto Supabase**: registrar versión real y extensiones antes del diseño definitivo | [Versionado oficial](https://www.postgresql.org/support/versioning/), [actualizaciones en Supabase](https://supabase.com/docs/guides/platform/upgrading) |

Fijar Node local con `.nvmrc` o archivo equivalente y declarar la rama 24 en `engines`. En hosting gestionado puede elegirse la rama y el proveedor aplicar su propio parche: registrar y verificar el runtime efectivo en lugar de prometer que puede fijarse exactamente igual al local.

No promover una versión mayor de PostgreSQL solo porque sea la última upstream. La disponibilidad y el procedimiento dependen del proyecto de Supabase.

## Restricciones de compatibilidad comprobadas en metadatos

| Relación | Requisito declarado | Implicación |
| --- | --- | --- |
| Next.js 16.4.1 → Node | >=20.9.0 | Node 24 satisface este mínimo |
| Next.js 16.4.1 → React / React DOM | Incluye ^19.0.0 | La pareja 19.3.1 entra en el rango |
| React DOM 19.3.1 → React | ^19.3.1 | No mezclar React DOM nuevo con React 19.3.0 |
| Supabase JS consultado → Node | >=22.0.0 | Node 24 satisface el requisito |
| Supabase SSR 0.12.7 → Supabase JS | ^2.114.0 | La base 2.117.2 entra en el rango |
| typescript-eslint 8.71.2 → TypeScript | >=4.8.4 y <6.1.0 | TypeScript 7.0.2 queda fuera del soporte declarado |
| Plugins React / import / jsx-a11y | Sus rangos incluyen ESLint 9 y excluyen 10 | Mantener ESLint 9.39.5 en este conjunto |
| Vitest 5.0.4 consultado → Node | ^22.12.0, ^24.0.0 o >=26.0.0 | Node 24 es una rama admitida; revisar también el conjunto de pruebas al instalar |

Fuentes de los plugins: [typescript-eslint](https://registry.npmjs.org/typescript-eslint/latest), [React](https://registry.npmjs.org/eslint-plugin-react/latest), [import](https://registry.npmjs.org/eslint-plugin-import/latest), [accesibilidad](https://registry.npmjs.org/eslint-plugin-jsx-a11y/latest). Las restricciones de las versiones base deben volver a comprobarse al resolver el archivo de bloqueo.

Next.js ya documenta uso de TypeScript 7 para la compilación mediante CLI. El motivo de mantener TypeScript 6 aquí es el soporte del conjunto de lint, no una afirmación de que Next.js no admita TypeScript 7. [Documentación oficial](https://nextjs.org/docs/app/api-reference/config/typescript).

## Tecnologías gestionadas y opciones sin paquete fijado

| Tecnología mencionada | Tratamiento de versión |
| --- | --- |
| Supabase Database, Auth, RLS, Cron y Edge Functions | Servicios gestionados; registrar runtime y extensiones reales. El SDK y la CLI sí tienen versiones en la tabla |
| Vercel Pro y GitHub | Servicios gestionados; no hay una versión npm global que fijar para el sitio |
| Resend servicio / SMTP | Servicio gestionado; el SDK `resend` está versionado arriba |
| Cal.com | Se propone un enlace a su servicio; no se instala ni autohospeda una versión de Cal.com |
| Cloudflare Turnstile | Integración opcional del servicio; revisar contrato y validación del token al activarla |
| Upstash Redis | Alternativa pendiente al límite en PostgreSQL; elegir y fijar un SDK solo si se adopta |
| WhatsApp Business Platform | Canal futuro; fijar versión de API y proveedor al activarlo, con verificación de disponibilidad y ciclo de soporte en ese momento |
| Analítica y monitoreo | Herramientas aún sin elegir; no inventar versiones ni añadir SDKs antes de decidir |
| CSS, Server Components y Server Actions | CSS de la plataforma web y capacidades del conjunto React/Next.js; no paquetes independientes |

El changelog de Supabase consultado también anuncia cambios de cifrados TLS y de adaptadores de framework. Revisar esos cambios antes de implementar, manteniendo clientes y runtime soportados. [Changelog](https://supabase.com/changelog), [cambio TLS](https://supabase.com/changelog/cbc-tls-ciphers-deprecated), [adaptadores](https://supabase.com/changelog/supabase-server-adapters-deprecated).

## Procedimiento para fijar y actualizar

- [ ] Confirmar npm o pnpm y conservar un único archivo de bloqueo.
- [ ] Instalar dependencias directas y herramientas con versión exacta, sin `^` ni `~`.
- [ ] Mantener las dependencias transitivas resueltas en el archivo de bloqueo.
- [ ] Alinear Next.js y su configuración ESLint; React y React DOM; tipos con la rama de runtime.
- [ ] Revisar avisos de seguridad y anotar excepciones a la espera de 14 días.
- [ ] Comprobar requisitos declarados sin forzar conflictos con `--legacy-peer-deps`.
- [ ] Ejecutar instalación reproducible, tipos, lint, compilación y pruebas del formulario/CRM cuando exista el proyecto.
- [ ] Actualizar esta tabla con la combinación realmente instalada y la fecha de validación.

## Ajustes pendientes

- [ ] **Mantener antigüedad de 14 días para cambios ordinarios:** ____________________
- [ ] **Excepciones de seguridad y actualizaciones coordinadas propuestas:** ____________________
- [ ] **npm o pnpm:** ____________________
- [ ] **Versión real de PostgreSQL y extensiones del proyecto:** ____________________
- [ ] **Versiones y herramientas de analítica/monitoreo al elegir proveedor:** ____________________

