export function About() {
  return (
    <section
      className="about section-pad"
      id="nosotros"
      aria-labelledby="about-title"
    >
      <div className="wrap about-grid">
        <div className="about-main">
          <p className="section-intro">Flores Systems</p>
          <h2 id="about-title">Tecnología para crecer contigo.</h2>
        </div>
        <div className="about-details">
          <div>
            <h3>Nuestra meta</h3>
            <p>
              Ayudar a pequeños negocios a trabajar con más orden y a
              presentarse con una web que refleje su identidad.
            </p>
          </div>
          <div>
            <h3>Nuestra visión</h3>
            <p>
              Crear experiencias digitales útiles, ágiles y memorables para
              quienes están dando el siguiente paso.
            </p>
          </div>
        </div>
        <div className="process">
          <p>Así comenzamos</p>
          <ol>
            <li>
              <strong>Conversamos</strong>
              <span>
                Nos cuentas cómo funciona tu negocio y qué quieres mejorar.
              </span>
            </li>
            <li>
              <strong>Definimos</strong>
              <span>
                Ordenamos las ideas y elegimos una dirección visual y funcional.
              </span>
            </li>
            <li>
              <strong>Diseñamos</strong>
              <span>
                Revisamos la propuesta contigo antes de llevarla a desarrollo.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
