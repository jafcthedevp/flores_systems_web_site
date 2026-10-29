"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommerceDemo } from "./commerce-demo";
import { VeterinaryDemo } from "./veterinary-demo";
import { ScrollMotion, demoScrollTargets } from "../landing/scroll-motion";

export function BusinessDemo({
  kind,
}: {
  kind: "tienda" | "veterinaria" | "restaurante";
}) {
  const [revision, setRevision] = useState(0);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const vet = kind === "veterinaria";
  const shop = kind === "tienda";
  const navigation = vet
    ? [
        ["Agenda y pacientes", ".workspace-heading"],
        ["Buscar paciente", ".demo-filters"],
        ["Nueva cita", ".demo-panel"],
        ["Guía de atención", ".workspace-guide"],
      ]
    : [
        [shop ? "Punto de venta" : "Carta y pedidos", ".workspace-heading"],
        [shop ? "Inventario" : "Buscar en la carta", ".demo-filters"],
        [shop ? "Caja" : "Pedido actual", ".demo-cart"],
        [
          shop ? "Ventas y devoluciones" : "Seguimiento de cocina",
          shop ? ".demo-sales-history" : ".demo-orders",
        ],
        ["Guía de uso", ".workspace-guide"],
      ];
  function navigate(index: number) {
    setActive(index);
    const target = root.current?.querySelector<HTMLElement>(
      navigation[index][1],
    );
    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  return (
    <ScrollMotion selector={demoScrollTargets}>
      <div className={`workspace-shell workspace-${kind}`} ref={root}>
        <aside
          className="workspace-sidebar"
          aria-label="Navegación del sistema"
        >
          <a className="product-wordmark" href="#workspace-start">
            {vet ? "nido" : shop ? "punto" : "mesa"}
            <span>®</span>
          </a>
          <p>
            {vet
              ? "Cuidado conectado"
              : shop
                ? "Comercio en movimiento"
                : "El servicio, en orden"}
          </p>
          <nav aria-label="Módulos de la demo">
            {navigation.map(([label], index) => (
              <button
                key={label}
                aria-current={active === index ? "location" : undefined}
                onClick={() => navigate(index)}
              >
                <span aria-hidden="true">
                  {["◫", "▦", "+", "◷", "?"][index]}
                </span>
                {label}
              </button>
            ))}
          </nav>
          <div className="workspace-sidebar-footer">
            <span className="preview-avatar">FS</span>
            <div>
              Equipo de prueba<small>Acceso de demostración</small>
            </div>
          </div>
          <Link href="/demos">Explorar otros negocios ↗</Link>
        </aside>
        <div className="workspace-body" id="workspace-start">
          <div className="workspace-topbar">
            <span>
              Mi negocio <span aria-hidden="true">/</span>{" "}
              {navigation[active][0]}
            </span>
            <label>
              Cambiar demo
              <select
                aria-label="Cambiar demo"
                value={kind}
                onChange={(event) => {
                  router.push(`/demos/${event.target.value}`);
                }}
              >
                <option value="tienda">Tienda</option>
                <option value="restaurante">Restaurante</option>
                <option value="veterinaria">Veterinaria</option>
              </select>
            </label>
          </div>
          <div className="workspace-banner">
            <div>
              <span>Tu espacio de trabajo</span>
              <h2>
                {vet
                  ? "Cada paciente, bien acompañado."
                  : shop
                    ? "Un buen día empieza con todo en orden."
                    : "Todo listo para un gran servicio."}
              </h2>
              <p>
                {vet
                  ? "Organiza la agenda y sigue cada atención desde su ficha."
                  : shop
                    ? "Productos, caja y movimientos en un mismo lugar."
                    : "De la primera orden al último plato. Sin perder el hilo."}
              </p>
            </div>
            <span className="workspace-banner-symbol" aria-hidden="true">
              {vet ? "✳" : shop ? "▦" : "◉"}
            </span>
          </div>
          <div className="demo-workspace">
            <div className="demo-reset-row">
              <p>Prueba los controles y recorre una operación completa.</p>
              <button
                className="button button-text"
                onClick={() => setRevision((value) => value + 1)}
              >
                Reiniciar demo
              </button>
            </div>
            {kind === "veterinaria" ? (
              <VeterinaryDemo key={`${kind}-${revision}`} />
            ) : (
              <CommerceDemo key={`${kind}-${revision}`} kind={kind} />
            )}
            <section className="workspace-guide">
              <h3>
                {vet
                  ? "Recorre una atención completa"
                  : "Prueba una operación de principio a fin"}
              </h3>
              <div>
                {(vet
                  ? [
                      [
                        "Encuentra al paciente",
                        "Busca por nombre o filtra la agenda por estado.",
                      ],
                      [
                        "Abre su ficha",
                        "Actualiza la atención, añade notas y reprograma la cita.",
                      ],
                      [
                        "Prepara el seguimiento",
                        "Crea un recordatorio desde la ficha del paciente.",
                      ],
                    ]
                  : [
                      [
                        "Elige y personaliza",
                        shop
                          ? "Busca un producto. Si no hay stock, repón unidades."
                          : "Abre las opciones de un plato y elige sus adicionales.",
                      ],
                      [
                        "Confirma la operación",
                        shop
                          ? "Añade un descuento, elige el pago y calcula el vuelto."
                          : "Selecciona mesa o para llevar y envía el pedido.",
                      ],
                      [
                        "Sigue lo que ocurre",
                        shop
                          ? "Consulta la venta y prueba una devolución con reposición."
                          : "Avanza la preparación en cocina hasta la entrega.",
                      ],
                    ]
                ).map(([title, text], i) => (
                    <div className="workspace-guide-step" key={title}>
                    <span>{i + 1}</span>
                    <h4>{title}</h4>
                    <p>{text}</p>
                    </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </ScrollMotion>
  );
}
