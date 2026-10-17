import Link from "next/link";
export function DemoLinks() {
  return (
    <section
      className="section-pad business-demos"
      id="demos"
      aria-labelledby="demos-title"
    >
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
              "Registra citas, reprograma horarios y explora las fichas.",
            ],
            [
              "restaurante",
              "Restaurante",
              "Arma un pedido y sigue su preparación hasta la entrega.",
            ],
            [
              "tienda",
              "Tienda o bodega",
              "Repón productos, simula una venta y calcula el vuelto.",
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
    </section>
  );
}
