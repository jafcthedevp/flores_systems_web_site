import Link from "next/link";
import { ScrollScene } from "./scroll-motion";
import { IntegrationBadges } from "./integration-badges";

export function Solutions() {
  return (
    <section
      className="solutions section-pad services-editorial"
      id="soluciones"
      aria-labelledby="solutions-title"
    >
      <ScrollScene scene="solutions">
        <div className="wrap">
          <div className="section-heading services-heading">
            <h2 id="solutions-title">
              Que todo funcione.
              <br />
              Que se sienta tuyo.
            </h2>
            <p>
              Tu negocio necesita herramientas que simplifiquen el día y una
              presencia digital que lo represente. Diseñamos ambas alrededor de
              ti.
            </p>
          </div>
          <div className="services-pair">
            <article className="solution service-panel service-operations">
              <div className="service-art service-flow" aria-hidden="true">
                <span>Menos vueltas.</span>
                <strong>
                  Más
                  <br />
                  claridad.
                </strong>
                <div className="service-flow-path">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="service-content">
                <span className="service-category">Para tu equipo</span>
                <h3>Sistemas administrativos</h3>
                <p>
                  Conecta lo que hoy está disperso. Ventas, inventario, citas y
                  seguimiento en un espacio pensado para tu operación.
                </p>
                <ul>
                  <li>Información a mano</li>
                  <li>Procesos conectados</li>
                  <li>Control del día a día</li>
                </ul>
                <Link href="/#contacto">
                  Hablemos de tu sistema <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
            <article className="solution service-panel service-presence">
              <div
                className="service-art service-expression"
                aria-hidden="true"
              >
                <span>Una presencia propia.</span>
                <strong>
                  Imposible
                  <br />
                  pasar de largo.
                </strong>
                <i />
              </div>
              <div className="service-content">
                <span className="service-category">Para tus clientes</span>
                <h3>Sitios web creativos</h3>
                <p>
                  Haz que el primer encuentro cuente. Identidad, contenido y
                  movimiento para que conozcan tu negocio y quieran dar el
                  siguiente paso.
                </p>
                <ul>
                  <li>Identidad visual</li>
                  <li>Navegación intuitiva</li>
                  <li>Diseño en movimiento</li>
                </ul>
                <Link href="/#contacto">
                  Hablemos de tu web <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </div>
          <p className="services-note">
            Pueden crecer por separado. Juntos, conectan lo que muestras con lo
            que haces.
          </p>
          <IntegrationBadges />
        </div>
      </ScrollScene>
    </section>
  );
}
