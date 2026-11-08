"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import styles from "./demo-gallery.module.css";
import { WrittenHeading } from "../landing/written-heading";

const concepts = [
  {
    slug: "restaurante",
    name: "Mesa / Restaurante",
    title: "De la mesa a cocina. Sin perder un detalle.",
    description:
      "Personaliza cada plato, toma pedidos y acompaña su preparación hasta la entrega.",
    brand: "mesa",
    section: "Servicio de almuerzo",
    nav: ["Vista general", "Pedidos", "Carta", "Cocina"],
    metrics: ["8 mesas", "3 en cocina", "12 platos"],
    rows: [
      ["Mesa 04", "Lomo saltado · sin cebolla", "En preparación"],
      ["Para llevar", "Menú del día · ensalada", "Recibido"],
      ["Mesa 02", "Causa limeña + limonada", "Listo para servir"],
    ],
  },
  {
    slug: "veterinaria",
    name: "Nido / Veterinaria",
    title: "Más tiempo para cuidar. Todo lo demás, en orden.",
    description:
      "Una agenda conectada con cada paciente: fichas, evolución de la atención y recordatorios.",
    brand: "nido",
    section: "La agenda de hoy",
    nav: ["Vista general", "Agenda", "Pacientes", "Seguimiento"],
    metrics: ["3 pacientes", "1 en espera", "1 atendido"],
    rows: [
      ["09:30 · Luna", "Consulta · primera visita", "Pendiente"],
      ["10:15 · Toby", "Vacunación · control anual", "En espera"],
      ["11:00 · Milo", "Control · seguimiento", "Atendido"],
    ],
  },
  {
    slug: "tienda",
    name: "Punto / Tienda",
    title: "Cada venta cuenta. Cada producto, bajo control.",
    description:
      "Busca productos, ajusta existencias y prueba una venta completa con descuentos y devoluciones.",
    brand: "punto",
    section: "Tu negocio, a la vista",
    nav: ["Vista general", "Caja", "Inventario", "Ventas"],
    metrics: ["5 productos", "2 por reponer", "2 categorías"],
    rows: [
      ["Arroz 1 kg", "Despensa · grano extra", "24 disponibles"],
      ["Aceite 1 L", "Despensa · aceite vegetal", "Stock bajo"],
      ["Agua 625 ml", "Bebidas · sin gas", "Por reponer"],
    ],
  },
];

export function DemoLinks() {
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState(0);
  const target = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end end"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.55, 1], [14, 0, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [0.82, 1, 1]);
  const y = useTransform(scrollYProgress, [0, 0.55, 1], [130, 0, -25]);
  const demo = concepts[selected];
  return (
    <section
      className={`${styles.theater} product-theater`}
      id="demos"
      ref={target}
      aria-labelledby="demos-title"
    >
      <div className="wrap theater-sticky">
        <div className="theater-heading">
          <div>
            <p>Diseñado para el ritmo de tu negocio</p>
            <WrittenHeading id="demos-title">
              No lo imagines.
              <br />
              Explóralo.
            </WrittenHeading>
          </div>
          <p>
            Una interfaz que se entiende. Una operación que fluye. Elige una
            experiencia y descubre lo que puede inspirar para tu proyecto.
          </p>
        </div>
        <div className="theater-select" aria-label="Elegir demo">
          {concepts.map((item, i) => (
            <button
              key={item.slug}
              aria-pressed={i === selected}
              onClick={() => {
                setSelected(i);
                setView(0);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <motion.div className="theater-frame" style={{ rotateX, scale, y }}>
          <div className="preview-chrome">
            <span>
              <i />
              <i />
              <i />
            </span>
            <span>Flores Systems / Experiencia interactiva</span>
            <span>Vista conceptual</span>
          </div>
          <div className={`product-preview preview-${demo.slug}`}>
            <nav
              className="preview-sidebar"
              aria-label="Vista previa del producto"
            >
              <strong className="product-wordmark">
                {demo.brand}
                <span>®</span>
              </strong>
              <small>Tu espacio de trabajo</small>
              {demo.nav.map((label, i) => (
                <button
                  key={label}
                  aria-pressed={i === view}
                  onClick={() => setView(i)}
                >
                  <span aria-hidden="true">{["◫", "▤", "▦", "◷"][i]}</span>
                  {label}
                </button>
              ))}
              <div className="preview-person">
                <b>FS</b>
                <span>
                  Equipo de prueba<small>Administrador</small>
                </span>
              </div>
            </nav>
            <div className="preview-main" key={`${selected}-${view}`}>
              <div className="preview-topbar">
                <span>{demo.nav[view]}</span>
                <span className="preview-live">Datos de ejemplo</span>
              </div>
              <div className="preview-welcome">
                <div>
                  <p>Todo listo para empezar</p>
                  <WrittenHeading as="h3">
                    {view === 0 ? demo.section : demo.nav[view]}
                  </WrittenHeading>
                </div>
                <span className="preview-avatar">FS</span>
              </div>
              <div className="preview-metrics">
                {demo.metrics.map((metric) => (
                  <div key={metric}>
                    <span>{metric.split(" ")[0]}</span>
                    <small>{metric.split(" ").slice(1).join(" ")}</small>
                    <svg viewBox="0 0 100 30" aria-hidden="true">
                      <path d="M0 26 L15 20 L28 24 L43 10 L56 15 L72 5 L85 9 L100 2" />
                    </svg>
                  </div>
                ))}
              </div>
              {view === 0 ? (
                <div className="preview-activity">
                  <div>
                    <p>Una jornada en movimiento</p>
                    <strong>
                      Todo conectado.
                      <br />
                      Todo a tu alcance.
                    </strong>
                  </div>
                  <div
                    className="activity-bars"
                    aria-label="Gráfico ilustrativo de actividad"
                  >
                    {[34, 58, 43, 76, 61, 92, 74, 100, 85, 65, 88, 96].map(
                      (height, i) => (
                        <i key={i} style={{ height: `${height}%` }} />
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="preview-module-note">
                  <strong>{demo.nav[view]}, sin perder el contexto.</strong>
                  <p>{demo.description}</p>
                  <Link href={`/demos/${demo.slug}`}>
                    Abrir este espacio de trabajo ↗
                  </Link>
                </div>
              )}
              <div className="preview-table">
                <div className="preview-table-heading">
                  <strong>
                    {view === 0 ? "Actividad reciente" : demo.nav[view]}
                  </strong>
                  <span>Muestra de interfaz</span>
                </div>
                {demo.rows.map(([name, detail, status]) => (
                  <div className="preview-row" key={name}>
                    <b>{name}</b>
                    <span>{detail}</span>
                    <em>{status}</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        <div className="theater-caption">
          <div>
            <WrittenHeading as="h3">{demo.title}</WrittenHeading>
            <p>{demo.description}</p>
          </div>
          <Link
            className="button button-primary"
            href={`/demos/${demo.slug}`}
            data-analytics="demo_click"
          >
            Explorar demo <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="theater-disclaimer">
          Conceptos propios con datos ficticios. Las demos permiten probar
          operaciones; no representan proyectos de clientes.
        </p>
      </div>
    </section>
  );
}
