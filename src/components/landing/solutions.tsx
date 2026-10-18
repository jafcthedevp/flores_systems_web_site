import { ScrollScene } from "./scroll-motion";

export function Solutions() {
  return (
    <section
      className="solutions section-pad"
      id="soluciones"
      aria-labelledby="solutions-title"
    >
      <ScrollScene scene="solutions">
        <div className="wrap">
          <div className="section-heading solutions-heading">
            <p className="section-intro">Lo que podemos crear</p>
            <h2 id="solutions-title">
              Un sistema para avanzar.
              <br />
              Un sitio para destacar.
            </h2>
            <p>
              Dos necesidades distintas, una misma intención: hacer que la
              tecnología trabaje a favor de tu negocio.
            </p>
          </div>

          <div className="solutions-grid">
            <article className="solution solution-system">
              <div className="solution-copy">
                <span className="solution-tag">Organiza tu operación</span>
                <h3>Sistemas administrativos</h3>
                <p>
                  Reúne procesos, registros y tareas en una interfaz clara para
                  tu equipo.
                </p>
                <ul className="feature-list">
                  <li>Paneles fáciles de entender</li>
                  <li>Información en un solo lugar</li>
                  <li>Flujos pensados para tu día a día</li>
                </ul>
              </div>
              <div className="dashboard-preview" aria-hidden="true">
                <div className="dashboard-top">
                  <span></span>
                  <span></span>
                  <span></span>
                  <small>Resumen del negocio</small>
                </div>
                <div className="dashboard-body">
                  <div className="dashboard-side">
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <div className="dashboard-main">
                    <div className="dashboard-greeting">
                      Buen día, equipo <b>↗</b>
                    </div>
                    <div className="metric-row">
                      <span>
                        <small>Clientes</small>
                        <strong>Activos</strong>
                      </span>
                      <span>
                        <small>Procesos</small>
                        <strong>En orden</strong>
                      </span>
                    </div>
                    <div className="chart">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="solution solution-creative">
              <div className="solution-copy">
                <span className="solution-tag">Haz visible tu esencia</span>
                <h3>Sitios web creativos</h3>
                <p>
                  Una presencia digital con identidad, navegación sencilla y
                  detalles que invitan a explorar.
                </p>
                <ul className="feature-list">
                  <li>Diseño adaptable a cada pantalla</li>
                  <li>Animaciones que cuentan algo</li>
                  <li>Contenido fácil de recorrer</li>
                </ul>
              </div>
              <div className="creative-preview" aria-hidden="true">
                <div className="creative-orb"></div>
                <span className="creative-preview-label">
                  Vista conceptual / Spa
                </span>
                <span className="creative-preview-title">
                  Un momento
                  <br />
                  para ti.
                </span>
                <span className="creative-preview-link">
                  Descubre el espacio ↗
                </span>
              </div>
            </article>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
