import { ScrollScene } from "./scroll-motion";

const possibilities = [
  [
    "Organizar tu operación",
    "Más claridad para lo que ocurre cada día.",
    "Procesos",
    "Información",
    "Control",
  ],
  [
    "Conectar a tu equipo",
    "Un mismo espacio para trabajar con información compartida.",
    "Coordinación",
    "Tareas",
    "Comunicación",
  ],
  [
    "Dar seguimiento a lo importante",
    "Cada pendiente y cada avance, fáciles de encontrar.",
    "Registros",
    "Recordatorios",
    "Seguimiento",
  ],
  [
    "Hacer visible tu marca",
    "Una presencia digital que expresa lo que te hace diferente.",
    "Identidad",
    "Contenido",
    "Experiencia",
  ],
  [
    "Simplificar la atención",
    "Un recorrido más claro desde el primer contacto.",
    "Consultas",
    "Solicitudes",
    "Respuestas",
  ],
];

export function Sectors() {
  return (
    <section
      className="sectors section-pad sectors-editorial"
      id="sectores"
      aria-labelledby="sectors-title"
    >
      <ScrollScene scene="sectors">
        <div className="wrap sectors-layout">
          <div className="section-heading sectors-heading">
            <h2 id="sectors-title">
              Lo que necesitas,
              <br />a tu manera.
            </h2>
            <p>
              Partimos de tus objetivos y de tu forma de trabajar. Desde ahí,
              diseñamos una solución que tenga sentido para ti, tu equipo y tus
              clientes.
            </p>
            <a href="#contacto" className="sectors-contact">
              Cuéntanos qué tienes en mente <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="sector-directory">
            {possibilities.map(([name, description, ...capabilities]) => (
              <article className="sector sector-directory-row" key={name}>
                <h3>{name}</h3>
                <p>{description}</p>
                <ul aria-label={`Ideas para ${name.toLowerCase()}`}>
                  {capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
