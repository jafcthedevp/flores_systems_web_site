import { MotionInteractions } from "./motion-interactions";
import { ScrollScene } from "./scroll-motion";
export function MotionContent() {
  return (
    <MotionInteractions>
      <section
        className="motion section-pad"
        id="animaciones"
        aria-labelledby="motion-title"
      >
        <div className="wrap motion-layout">
          <div className="motion-intro">
            <p className="section-intro">Galería de movimiento</p>
            <h2 id="motion-title">
              Pequeños gestos.
              <br />
              Grandes sensaciones.
            </h2>
            <p>
              Prueba tres formas de dar vida a una página. Cada efecto tiene un
              motivo: mostrar, ambientar o responder.
            </p>
          </div>

          <ScrollScene scene="gallery">
            <div className="demo-list">
              <article className="motion-demo" data-demo="reveal">
                <div className="demo-stage reveal-stage" aria-hidden="true">
                  <div className="reveal-card reveal-card-back"></div>
                  <div className="reveal-card reveal-card-mid"></div>
                  <div className="reveal-card reveal-card-front">
                    <span>
                      Una historia
                      <br />
                      que aparece.
                    </span>
                  </div>
                </div>
                <div className="demo-description">
                  <div>
                    <h3>Revelado al recorrer</h3>
                    <p>
                      El contenido entra cuando llega su momento en la página.
                    </p>
                  </div>
                </div>
              </article>

              <article className="motion-demo" data-demo="ambient">
                <div className="demo-stage ambient-stage" aria-hidden="true">
                  <div className="ambient-orb ambient-orb-one"></div>
                  <div className="ambient-orb ambient-orb-two"></div>
                  <span>
                    Respira.
                    <br />
                    Explora.
                  </span>
                </div>
                <div className="demo-description">
                  <div>
                    <h3>Fondo que acompaña</h3>
                    <p>
                      Movimiento suave que construye atmósfera sin tapar el
                      mensaje.
                    </p>
                  </div>
                </div>
              </article>

              <article className="motion-demo" data-demo="response">
                <div className="demo-stage response-stage">
                  <span className="response-label">
                    Una respuesta clara a cada acción
                  </span>
                  <button
                    className="try-button"
                    type="button"
                    aria-pressed="false"
                  >
                    Probar interacción <span aria-hidden="true">↗</span>
                  </button>
                  <span
                    className="response-signal"
                    role="status"
                    aria-live="polite"
                  >
                    Toca el botón
                  </span>
                </div>
                <div className="demo-description">
                  <div>
                    <h3>Microinteracción</h3>
                    <p>Un detalle confirma lo que acaba de pasar.</p>
                  </div>
                </div>
              </article>
            </div>
          </ScrollScene>
        </div>
      </section>
    </MotionInteractions>
  );
}
