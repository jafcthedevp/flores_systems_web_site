import Image from "next/image";
import Link from "next/link";
import { Header } from "./header";
import { Contact } from "./contact";
import { Footer } from "./footer";
import { AnalyticsEvents } from "./analytics-events";
import { GlassFilm } from "./glass-film";
import { site } from "@/lib/site";
import styles from "./agentic.module.css";
import { WrittenHeading } from "./written-heading";

// Visual reference and media: Agentic by kerroudj.
// https://v0.app/templates/agentic-build-orchestrate-ai-agents-while-you-ugbOGUSE9MB
// Images are stored locally as optimized WebP files in public/agentic.

const services = [
  {
    image: "research",
    tag: "Diseño web",
    title: "Una web que se siente tuya.",
    description:
      "Diseño, contenido y movimiento para mostrar lo mejor de tu marca. Una experiencia clara y cuidada en cada pantalla.",
    features: ["Diseño a medida", "Adaptable a móviles"],
  },
  {
    image: "code",
    tag: "Sistemas administrativos",
    title: "Menos tareas. Más control.",
    description:
      "Ventas, inventario, citas y reportes en un solo lugar. Herramientas que se adaptan a cómo trabaja tu negocio.",
    features: ["Todo conectado", "Información organizada"],
  },
  {
    image: "analytics",
    tag: "Información útil",
    title: "Entiende lo que pasa en tu negocio.",
    description:
      "Consulta tus datos sin perderte entre hojas de cálculo. Paneles claros para seguir tu actividad y tomar decisiones.",
    features: ["Paneles de gestión", "Reportes claros"],
  },
  {
    image: "automation",
    tag: "Conexiones y automatización",
    title: "Haz que el trabajo fluya.",
    description:
      "Conecta tus herramientas y simplifica las tareas que se repiten. Más tiempo para atender a tus clientes y hacer crecer tu idea.",
    features: ["Flujos a medida", "Menos trabajo manual"],
  },
];
const steps = [
  [
    "define",
    "Conversemos",
    "Entendemos tu negocio, tus objetivos y lo que necesitas mejorar.",
  ],
  [
    "compose",
    "Diseñamos",
    "Damos forma a la estructura y al diseño. Revisamos contigo la propuesta.",
  ],
  [
    "test",
    "Construimos",
    "Desarrollamos y probamos los detalles, funciones y experiencia de uso.",
  ],
  [
    "deploy",
    "Lanzamos",
    "Publicamos tu proyecto y te acompañamos para que puedas usarlo.",
  ],
];
function SectionHeading({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.spark} aria-hidden="true">
        ✳
      </span>
      <span className={styles.label}>{label}</span>
      <WrittenHeading>{children}</WrittenHeading>
    </div>
  );
}
export function AgenticLanding() {
  return (
    <div className={styles.page}>
      <AnalyticsEvents />
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <Header overHero />
      <main id="contenido">
        <section
          className={styles.hero}
          id="inicio"
          aria-labelledby="hero-title"
        >
          <GlassFilm />
          <div className={styles.heroFade} />
          <div className={styles.heroCopy}>
            <h1 id="hero-title">
              Que el trabajo
              <br /> fluya. Que tu
              <br /> marca se note.
            </h1>
            <div className={styles.heroBottom}>
              <div className={styles.heroServices}>
                <span>
                  <strong>Web</strong>
                  <small>Con identidad</small>
                </span>
                <span>
                  <strong>Sistemas</strong>
                  <small>A tu medida</small>
                </span>
                <span>
                  <strong>Contigo</strong>
                  <small>En cada paso</small>
                </span>
              </div>
              <a className={styles.darkButton} href="#contacto">
                Hablemos de tu idea <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
        <section
          className={styles.section}
          id="soluciones"
          aria-label="Soluciones para tu negocio"
        >
          <div className={styles.wrap}>
            <SectionHeading label="Soluciones">
              Todo lo que necesitas.
              <br />
              Hecho para tu negocio.
            </SectionHeading>
            <div className={styles.platform}>
              <article className={styles.platformMain}>
                <Image
                  src="/agentic/arc.webp"
                  alt=""
                  fill
                  sizes="(max-width: 800px) 100vw, 1152px"
                />
                <div className={styles.platformCopy}>
                  <span className={styles.icon} aria-hidden="true">
                    ✳
                  </span>
                  <h3>De tu idea a una experiencia real.</h3>
                  <p>
                    Sitios web y sistemas que conectan diseño, tecnología y la
                    forma en que trabajas.
                  </p>
                </div>
              </article>
              {[
                [
                  "⌁",
                  "Diseño que se adapta",
                  "Una experiencia cómoda y consistente en computadoras, tablets y celulares.",
                ],
                [
                  "▤",
                  "Todo en su lugar",
                  "La información y las herramientas que necesitas, organizadas para tu día a día.",
                ],
                [
                  "◇",
                  "Acceso con cuidado",
                  "Permisos y funciones pensados para las personas que usan tu sistema.",
                ],
              ].map(([icon, title, text]) => (
                <article className={styles.feature} key={title}>
                  <span className={styles.icon} aria-hidden="true">
                    {icon}
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className={`${styles.section} ${styles.divided}`}
          aria-label="Nuestros servicios"
        >
          <div className={styles.wrap}>
            <div className={styles.headingRow}>
              <SectionHeading label="Lo que hacemos">
                Tecnología con propósito.
                <br />
                Diseño con intención.
              </SectionHeading>
              <p>
                Cada negocio tiene su propia forma de funcionar. Tu web y tus
                herramientas también deberían tenerla.
              </p>
            </div>
            <div className={styles.services}>
              {services.map((service) => (
                <article className={styles.service} key={service.image}>
                  <Image
                    src={`/agentic/${service.image}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 90vw, 1152px"
                  />
                  <div className={styles.serviceCopy}>
                    <span className={styles.label}>{service.tag}</span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className={styles.serviceFeatures}>
                      {service.features.map((feature) => (
                        <span key={feature}>{feature}</span>
                      ))}
                    </div>
                  </div>
                  <a
                    href="#contacto"
                    className={styles.serviceLink}
                    aria-label={`Consultar sobre ${service.tag}`}
                  >
                    <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className={`${styles.section} ${styles.divided}`}
          id="proceso"
          aria-label="Nuestro proceso"
        >
          <div className={styles.wrap}>
            <SectionHeading label="El proceso">
              De la primera conversación
              <br />a tu próximo lanzamiento.
            </SectionHeading>
            <div className={styles.steps}>
              {steps.map(([image, title, text], i) => (
                <article key={image}>
                  <div className={styles.stepArt}>
                    <Image
                      src={`/agentic/${image}.webp`}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 90vw, 280px"
                    />
                  </div>
                  <span className={styles.stepNumber}>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className={`${styles.section} ${styles.divided}`}
          id="sectores"
          aria-label="Posibilidades para tu negocio"
        >
          <div className={styles.wrap}>
            <div className={styles.headingRow}>
              <SectionHeading label="Posibilidades">
                Tu negocio, conectado.
                <br />
                Tu día, más simple.
              </SectionHeading>
              <p>
                Una solución puede empezar por una necesidad concreta y crecer
                contigo. Explora lo que podríamos construir.
              </p>
            </div>
            <div className={styles.integration}>
              <div className={styles.integrationArt}>
                <Image
                  src="/agentic/integrations.webp"
                  alt="Piezas de cristal conectadas, una representación de las herramientas de tu negocio"
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                />
              </div>
              <div className={styles.integrationList}>
                <Link href="/demos/restaurante">
                  <span>Restaurantes</span>
                  <p>Pedidos, mesas y ventas en un mismo lugar.</p>
                  <b aria-hidden="true">↗</b>
                </Link>
                <Link href="/demos/veterinaria">
                  <span>Veterinarias</span>
                  <p>Citas, pacientes y seguimiento de atención.</p>
                  <b aria-hidden="true">↗</b>
                </Link>
                <Link href="/demos/tienda">
                  <span>Tiendas y bodegas</span>
                  <p>Productos, inventario y control de ventas.</p>
                  <b aria-hidden="true">↗</b>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section
          className={`${styles.section} ${styles.divided}`}
          id="nosotros"
          aria-label="Sobre Flores Systems"
        >
          <div className={`${styles.wrap} ${styles.about}`}>
            <div>
              <SectionHeading label="Flores Systems">
                La tecnología se entiende
                <br />
                mejor cuando es cercana.
              </SectionHeading>
              <p>
                Detrás de cada proyecto hay una conversación. Escuchamos cómo
                funciona tu negocio y construimos una solución que tenga sentido
                para ti.
              </p>
              <a
                className={styles.glassButton}
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conversemos por WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className={styles.values}>
              <article>
                <span className={styles.icon} aria-hidden="true">
                  ◎
                </span>
                <div>
                  <h3>Trato directo</h3>
                  <p>Conversas con quien diseña y construye tu proyecto.</p>
                </div>
              </article>
              <article>
                <span className={styles.icon} aria-hidden="true">
                  ◇
                </span>
                <div>
                  <h3>Alcance claro</h3>
                  <p>Definimos juntos lo que necesitas antes de empezar.</p>
                </div>
              </article>
              <article>
                <span className={styles.icon} aria-hidden="true">
                  ⌁
                </span>
                <div>
                  <h3>Acompañamiento</h3>
                  <p>Te ayudamos a entender y usar lo que construimos.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section
          className={styles.demoSection}
          id="demos"
          aria-labelledby="demo-title"
        >
          <Image src="/agentic/footer.webp" alt="" fill sizes="100vw" />
          <div className={styles.demoCopy}>
            <span className={styles.label}>Explora antes de imaginar</span>
            <WrittenHeading id="demo-title">
              Hay ideas que se entienden
              <br />
              mejor al probarlas.
            </WrittenHeading>
            <p>
              Entra a nuestras demos. Prueba sus funciones e imagina lo que
              podemos crear para tu negocio.
            </p>
            <Link
              className={styles.darkButton}
              href="/demos"
              data-analytics="demo_click"
            >
              Explorar las demos <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
