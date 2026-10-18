import { ScrollScene } from "./scroll-motion";

export function Principles() {
  return (
    <section
      className="principles section-pad"
      id="rapidez"
      aria-labelledby="principles-title"
    >
      <ScrollScene scene="principles">
        <div className="wrap">
          <div className="principles-top">
            <p className="section-intro">Nuestra recomendación</p>
            <h2 id="principles-title">Primero, lo esencial.</h2>
            <p>
              Una buena experiencia se siente ágil porque cada decisión ayuda a
              encontrar lo importante.
            </p>
          </div>
          <div className="principles-grid">
            <article>
              <span className="principle-mark" aria-hidden="true">
                ◌
              </span>
              <h3>Contenido claro</h3>
              <p>
                Mostramos lo que tus clientes necesitan saber, en el orden
                correcto.
              </p>
            </article>
            <article>
              <span className="principle-mark" aria-hidden="true">
                ▤
              </span>
              <h3>Diseño móvil</h3>
              <p>
                Pensamos la navegación para pantallas pequeñas desde el inicio.
              </p>
            </article>
            <article>
              <span className="principle-mark" aria-hidden="true">
                ✳
              </span>
              <h3>Movimiento justo</h3>
              <p>
                Animamos lo que orienta y evitamos efectos que resten velocidad.
              </p>
            </article>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
