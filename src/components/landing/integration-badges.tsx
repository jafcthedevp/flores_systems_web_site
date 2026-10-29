"use client";

import Image from "next/image";
import { useState } from "react";

const integrations = [
  { name: "SUNAT", detail: "Facturación", tone: "sunat", logo: null },
  {
    name: "AWS",
    detail: "Infraestructura en la nube",
    tone: "aws",
    logo: "/brands/aws.png",
  },
  {
    name: "Yape",
    detail: "Pagos digitales",
    tone: "yape",
    logo: "/brands/yape.png",
  },
  {
    name: "WhatsApp",
    detail: "Comunicación",
    tone: "whatsapp",
    logo: "/brands/whatsapp.svg",
  },
  {
    name: "Culqi",
    detail: "Cobros en línea",
    tone: "culqi",
    logo: "/brands/culqi.svg",
  },
  {
    name: "Google Maps",
    detail: "Mapas y ubicaciones",
    tone: "maps",
    logo: "/brands/google-maps.png",
  },
  {
    name: "Mercado Pago",
    detail: "Checkout y pagos",
    tone: "mercadopago",
    logo: "/brands/mercadopago.svg",
  },
  {
    name: "Google Calendar",
    detail: "Agendas y eventos",
    tone: "calendar",
    logo: "/brands/google-calendar.svg",
  },
  {
    name: "Niubiz",
    detail: "Pagos con tarjeta",
    tone: "niubiz",
    logo: "/brands/niubiz.svg",
  },
  {
    name: "Resend",
    detail: "Correos automáticos",
    tone: "resend",
    logo: "/brands/resend.svg",
  },
];

export function IntegrationBadges() {
  const [paused, setPaused] = useState(false);
  return (
    <aside
      className="integration-strip"
      aria-labelledby="integrations-title"
      data-paused={paused}
    >
      <div className="integration-intro">
        <h3 id="integrations-title">Conectamos lo que necesitas.</h3>
        <p>Servicios e integraciones para una solución a tu medida.</p>
        <button
          className="integration-pause"
          type="button"
          aria-label={
            paused
              ? "Reanudar movimiento de integraciones"
              : "Pausar movimiento de integraciones"
          }
          aria-controls="integration-marquee"
          onClick={() => setPaused((value) => !value)}
        >
          <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
          {paused ? "Reanudar" : "Pausar"}
        </button>
      </div>
      <div
        className="integration-marquee"
        id="integration-marquee"
        tabIndex={0}
        role="region"
        aria-label="Integraciones disponibles. Usa las flechas para recorrer la lista."
      >
        <div className="integration-track">
          {[0, 1].map((copy) => (
            <ul
              className="integration-badges"
              key={copy}
              aria-label={
                copy === 0 ? "Posibilidades de integración" : undefined
              }
              aria-hidden={copy === 1 ? true : undefined}
            >
              {integrations.map(({ name, detail, tone, logo }) => (
                <li
                  className={`integration-badge integration-${tone}`}
                  key={name}
                >
                  {logo ? (
                    <span className="integration-symbol" aria-hidden="true">
                      <Image
                        src={logo}
                        alt=""
                        width={tone === "yape" ? 48 : 40}
                        height={tone === "yape" ? 48 : 40}
                        className="integration-logo"
                        loading="eager"
                      />
                    </span>
                  ) : null}
                  <span className="integration-text">
                    <strong>{name}</strong>
                    <small>{detail}</small>
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <a className="integration-more" href="#contacto">
        ¿Otra integración? <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
