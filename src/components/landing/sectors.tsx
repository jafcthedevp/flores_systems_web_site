import { ScrollScene } from "./scroll-motion";

export function Sectors() {
  return (
    <section
      className="sectors section-pad"
      id="sectores"
      aria-labelledby="sectors-title"
    >
      <ScrollScene scene="sectors">
        <div className="wrap">
          <div className="section-heading sectors-heading">
            <p className="section-intro">Ideas por sector</p>
            <h2 id="sectors-title">
              Tu negocio tiene una forma propia de crecer.
            </h2>
            <p>
              Estas son muestras conceptuales para imaginar lo que podemos
              construir juntos; no representan proyectos entregados a clientes.
            </p>
          </div>

          <div className="sector-grid">
            <article className="sector sector-vet">
              <div className="sector-copy">
                <span className="sector-type">Sistema + sitio web</span>
                <h3>Restaurantes</h3>
                <p>Carta digital, pedidos y una operación más clara.</p>
              </div>
              <div className="sector-art school-art" aria-hidden="true">
                <span>Carta del día</span>
                <i />
                <i />
                <i />
              </div>
            </article>
            <article className="sector sector-vet">
              <div className="sector-copy">
                <span className="sector-type">Sistema administrativo</span>
                <h3>Abarrotes y bodegas</h3>
                <p>Productos, stock y ventas fáciles de consultar.</p>
              </div>
              <div className="sector-art vet-art" aria-hidden="true">
                <span className="vet-card">
                  Inventario <b>En orden</b>
                </span>
              </div>
            </article>
            <article className="sector sector-school">
              <div className="sector-copy">
                <span className="sector-type">Sistema + sitio web</span>
                <h3>Mercados y puestos</h3>
                <p>Un registro claro para el movimiento de cada día.</p>
              </div>
              <div className="sector-art school-art" aria-hidden="true">
                <span>Ventas del día</span>
                <i />
                <i />
                <i />
              </div>
            </article>
            <article className="sector sector-vet">
              <div className="sector-copy">
                <span className="sector-type">Sistema + sitio web</span>
                <h3>Veterinarias</h3>
                <p>Agenda, fichas y seguimiento sin perder el trato cercano.</p>
              </div>
              <div className="sector-art vet-art" aria-hidden="true">
                <span className="vet-plus">+</span>
                <span className="vet-card">
                  Próxima cita <b>09:30</b>
                </span>
              </div>
            </article>
            <article className="sector sector-spa">
              <div className="sector-copy">
                <span className="sector-type">Sitio creativo</span>
                <h3>Spas</h3>
                <p>
                  Una experiencia digital que transmite calma desde el primer
                  vistazo.
                </p>
              </div>
              <div className="sector-art spa-art" aria-hidden="true">
                <span>pausa</span>
                <i></i>
              </div>
            </article>
            <article className="sector sector-school">
              <div className="sector-copy">
                <span className="sector-type">Sistema administrativo</span>
                <h3>Colegios</h3>
                <p>Información organizada para docentes, equipos y familias.</p>
              </div>
              <div className="sector-art school-art" aria-hidden="true">
                <span>Calendario</span>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </article>
            <article className="sector sector-fashion">
              <div className="sector-copy">
                <span className="sector-type">Sitio creativo</span>
                <h3>Tiendas de ropa</h3>
                <p>
                  Colecciones con ritmo visual y una vitrina que se recuerda.
                </p>
              </div>
              <div className="sector-art fashion-art" aria-hidden="true">
                <span>
                  Nueva
                  <br />
                  mirada.
                </span>
                <i></i>
              </div>
            </article>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
