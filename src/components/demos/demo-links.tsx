import Link from "next/link";
import { ScrollScene } from "../landing/scroll-motion";

export function DemoLinks() {
  return (
    <section
      className="section-pad business-demos"
      id="demos"
      aria-labelledby="demos-title"
    >
      <ScrollScene scene="demos">
        <div className="wrap">
          <div className="section-heading">
            <h2 id="demos-title">Prueba una idea para tu negocio.</h2>
            <p>
              Demostraciones propias con datos ficticios. Explora un flujo
              sencillo y conversemos sobre lo que necesitas.
            </p>
          </div>
          <div className="demo-links">
            {[
              [
                "veterinaria",
                "Veterinaria",
                "Recorre la atención y prepara recordatorios desde cada ficha.",
              ],
              [
                "restaurante",
                "Restaurante",
                "Personaliza platos y sigue sus indicaciones hasta cocina.",
              ],
              [
                "tienda",
                "Tienda o bodega",
                "Prueba ventas con descuento y devoluciones con reposición.",
              ],
            ].map(([slug, title, text]) => (
              <article key={slug}>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link
                  className="button button-text"
                  href={`/demos/${slug}`}
                  data-analytics="demo_click"
                >
                  Explorar demo
                </Link>
              </article>
            ))}
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
