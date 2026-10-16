import { QuoteForm } from "@/components/quote-form/quote-form";
import { submitQuote } from "@/app/actions/quote";
import { site } from "@/lib/site";
export function Contact() {
  return (
    <section
      className="contact section-pad"
      id="contacto"
      aria-labelledby="contact-title"
    >
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <p className="section-intro">Hablemos de tu idea</p>
          <h2 id="contact-title">El siguiente paso puede empezar aquí.</h2>
          <p>
            Cuéntame qué necesita tu negocio. El precio se define después de
            conversar sobre el alcance.
          </p>
          <div className="contact-actions">
            <a
              className="button button-primary"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbeme por WhatsApp
            </a>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
              +51 986 132 628
            </a>
            <a className="contact-email" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            {site.booking ? (
              <a
                href={site.booking}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="booking_click"
              >
                Agendar una llamada corta
              </a>
            ) : null}
          </div>
          {process.env.QUOTE_RATE_LIMIT_ENABLED !== "true" ? (
            <p className="form-hint">
              El formulario está en preparación. Mientras habilitamos la
              recepción, puedes contactarnos por WhatsApp o correo.
            </p>
          ) : null}
        </div>
        <QuoteForm submitAction={submitQuote} />
      </div>
    </section>
  );
}
