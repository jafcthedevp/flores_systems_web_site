import { MotionToggle } from "./motion-toggle";
export function Marquee() {
  return (
    <MotionToggle>
      {/* TODO para el próximo plan: tomar esta visualización como referencia y conservar el marquee de tarjetas con frases, sin imágenes ni etiquetas de sectores. */}
      <div
        className="specialties"
        role="region"
        aria-label="Ideas de Flores Systems"
      >
        <div className="specialties-marquee">
          <div className="specialties-track">
            <div className="specialties-set">
              <div className="specialty-tile specialty-sky">
                <strong>Ideas que pueden tomar forma</strong>
              </div>
              <div className="specialty-tile specialty-lilac">
                <strong>Experiencias que conectan</strong>
              </div>
              <div className="specialty-tile specialty-mint">
                <strong>Diseño con movimiento</strong>
              </div>
              <div className="specialty-tile specialty-rose">
                <strong>Tecnología para crecer</strong>
              </div>
            </div>
            <div className="specialties-set" aria-hidden="true">
              <div className="specialty-tile specialty-sky">
                <strong>Ideas que pueden tomar forma</strong>
              </div>
              <div className="specialty-tile specialty-lilac">
                <strong>Experiencias que conectan</strong>
              </div>
              <div className="specialty-tile specialty-mint">
                <strong>Diseño con movimiento</strong>
              </div>
              <div className="specialty-tile specialty-rose">
                <strong>Tecnología para crecer</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionToggle>
  );
}
