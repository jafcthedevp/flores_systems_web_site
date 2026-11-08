import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { DemoLinks } from "@/components/demos/demo-links";
import { AnalyticsEvents } from "@/components/landing/analytics-events";
import styles from "@/components/demos/demo-gallery.module.css";
import { WrittenHeading } from "@/components/landing/written-heading";

export const metadata: Metadata = {
  title: "Explora nuestras demos",
  description:
    "Explora experiencias interactivas y prueba distintas funciones con datos de ejemplo. Un punto de partida para imaginar una solución a tu medida.",
};

export default function DemosPage() {
  return (
    <div className={styles.hub}>
      <AnalyticsEvents />
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <Header />
      <main id="contenido" className="demos-hub">
        <div className="wrap demos-hub-intro">
          <Link href="/">Volver a Flores Systems</Link>
          <WrittenHeading as="h1">
            Entra. Prueba.
            <br />
            Encuentra posibilidades.
          </WrittenHeading>
          <p>
            Explora algunas experiencias de ejemplo. Prueba sus funciones e
            imagina cómo adaptarlas a lo que necesitas. Cada demo muestra una
            posibilidad; la tuya empieza con tus ideas.
          </p>
          <nav aria-label="Acceso directo a las demos">
            <Link href="/demos/restaurante">Restaurante ↗</Link>
            <Link href="/demos/veterinaria">Veterinaria ↗</Link>
            <Link href="/demos/tienda">Tienda o bodega ↗</Link>
          </nav>
        </div>
        <DemoLinks />
        <section
          className="wrap demos-hub-contact"
          aria-labelledby="hub-contact-title"
        >
          <div>
            <WrittenHeading id="hub-contact-title">
              Tu negocio tiene su propia forma de funcionar.
            </WrittenHeading>
            <p>
              Estas demos son un punto de partida. Conversemos sobre lo que
              necesitas.
            </p>
          </div>
          <Link href="/#contacto" className="button button-primary">
            Hablemos de tu proyecto ↗
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
