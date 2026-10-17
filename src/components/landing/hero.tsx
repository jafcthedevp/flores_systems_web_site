import Image from "next/image";
import { OrbitalScene } from "./orbital-scene";
export function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-grid wrap">
        <div className="hero-copy">
          <p className="hero-kicker">
            Tecnología y diseño para negocios en marcha
          </p>
          <h1 id="hero-title">
            Que el trabajo fluya.
            <br />
            Que tu marca se note.
          </h1>
          <p className="hero-description">
            Creamos sistemas que ponen orden y sitios web que muestran lo mejor
            de tu negocio. Cada experiencia empieza por entender qué necesitas.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contacto">
              Solicitar cotización <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-text" href="#demos">
              Ver las demos <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="hero-footnote">
            Diseño web · Sistemas administrativos · Experiencias con movimiento
          </p>
        </div>

        <OrbitalScene>
          <div className="hero-rose">
            <Image
              src="/img/flores-sys3_nobg.png"
              alt=""
              width="1254"
              height="1254"
              preload
              sizes="(max-width: 800px) 88vw, 620px"
            />
          </div>
        </OrbitalScene>
      </div>
    </section>
  );
}
