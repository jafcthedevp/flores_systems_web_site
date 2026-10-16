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
            ["veterinaria", "Veterinaria", "Agenda y atención de mascotas."],
            ["restaurante", "Restaurante", "Carta y pedidos de ejemplo."],
            [
              "tienda",
              "Tienda o bodega",
              "Productos, stock y venta de ejemplo.",
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
