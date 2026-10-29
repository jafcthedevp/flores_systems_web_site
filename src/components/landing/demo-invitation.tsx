import Link from "next/link";
import { ScrollScene } from "./scroll-motion";

export function DemoInvitation() {
  return (
    <section
      className="demo-invitation"
      id="demos"
      aria-labelledby="invitation-title"
    >
      <ScrollScene scene="demos">
        <div className="wrap invitation-layout">
          <div className="invitation-copy">
            <p>De la idea a la experiencia</p>
            <h2 id="invitation-title">
              Hay cosas que se entienden mejor al probarlas.
            </h2>
            <p>
              Explora distintas formas de organizar, conectar y dar vida a tus
              ideas. Las demos son un punto de partida para imaginar una
              solución a tu medida.
            </p>
            <Link
              href="/demos"
              className="button invitation-button"
              data-analytics="demo_click"
            >
              Ir al espacio de demos <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="invitation-art" aria-hidden="true">
            <div className="invitation-orbit" />
            <div className="invitation-orbit invitation-orbit-secondary" />
            <span className="invitation-center">
              Explora
              <br />
              lo posible.<span>↗</span>
            </span>
            <span className="invitation-label invitation-label-one">
              Organizar
            </span>
            <span className="invitation-label invitation-label-two">
              Conectar
            </span>
            <span className="invitation-label invitation-label-three">
              Crecer
            </span>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
