"use client";
import { useId, useState } from "react";
import type { BusinessKind } from "./business-dashboard";
import { DashboardIcon } from "./dashboard-icon";
import { money } from "./demo-data";
import styles from "./dashboard.module.css";
import { WrittenHeading } from "../landing/written-heading";

type Metric = { label: string; value: string; detail: string; icon: string };
type Segment = { label: string; value: number; color?: string };
const reference = {
  tienda: [120, 180, 155, 260, 210, 340, 390],
  restaurante: [18, 24, 20, 34, 28, 42, 48],
  veterinaria: [7, 11, 9, 14, 12, 18, 21],
};
export function DashboardOverview({
  kind,
  metrics,
  segments,
  sessionValues,
  breakdownTitle,
}: {
  kind: BusinessKind;
  metrics: Metric[];
  segments: Segment[];
  sessionValues: number[];
  breakdownTitle: string;
}) {
  const [period, setPeriod] = useState("reference");
  const [hovered, setHovered] = useState<number | null>(null);
  const gradient = useId().replaceAll(":", "");
  const values =
    period === "reference" ? reference[kind] : [0, ...sessionValues];
  const plot = values.length > 1 ? values : [0, 0];
  const max = Math.max(...plot, 1) * 1.2;
  const points = plot.map((value, index) => ({
    x: 52 + (index * 628) / (plot.length - 1),
    y: 220 - (value / max) * 180,
    value,
  }));
  const line = points
    .map((point, i) => `${i ? "L" : "M"}${point.x},${point.y}`)
    .join(" ");
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const titles = {
    tienda: "Evolución de ventas",
    restaurante: "Actividad del servicio",
    veterinaria: "Atenciones de la clínica",
  };
  const format = (value: number) =>
    kind === "tienda"
      ? money(Math.round(value * 100))
      : String(Math.round(value));
  const formatAxis = (value: number) =>
    kind === "tienda" ? `S/${Math.round(value)}` : String(Math.round(value));
  return (
    <section
      className={`${styles.overview} dashboard-overview`}
      aria-label="Resumen de la operación"
    >
      <div className={styles.metrics}>
        {metrics.map((metric) => (
          <div
            className={styles.metric}
            key={metric.label}
            role="group"
            aria-label={metric.label}
          >
            <div>
              <span>{metric.label}</span>
              <span className={styles.metricIcon}>
                <DashboardIcon name={metric.icon} />
              </span>
            </div>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>
      <div className={styles.analytics}>
        <section
          className={styles.chartPanel}
          aria-labelledby={`${gradient}-title`}
        >
          <div className={styles.panelHeading}>
            <div>
              <WrittenHeading id={`${gradient}-title`}>
                {titles[kind]}
              </WrittenHeading>
              <p>
                {period === "reference"
                  ? "Datos ficticios para explorar el gráfico"
                  : "Operaciones que realizas en esta demo"}
              </p>
            </div>
            <select
              aria-label="Período del gráfico"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                setHovered(null);
              }}
            >
              <option value="reference">Semana de ejemplo</option>
              <option value="session">Esta sesión</option>
            </select>
          </div>
          <div className={styles.chartLegend}>
            <span>
              <i />
              {kind === "tienda"
                ? "Ventas"
                : kind === "restaurante"
                  ? "Pedidos"
                  : "Atenciones"}
            </span>
            <small>
              {period === "reference"
                ? "Referencia ilustrativa"
                : "Actividad de esta sesión"}
            </small>
          </div>
          <div className={styles.chart}>
            <svg
              viewBox="0 0 710 265"
              role="img"
              aria-label={`${titles[kind]}. ${plot.map(format).join(", ")}`}
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--data-accent)"
                    stopOpacity=".24"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--data-accent)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <line
                    x1="52"
                    y1={40 + i * 60}
                    x2="680"
                    y2={40 + i * 60}
                    stroke="currentColor"
                    strokeOpacity=".1"
                    strokeDasharray="3 5"
                  />
                  <text x="0" y={44 + i * 60} fill="currentColor" fontSize="10">
                    {formatAxis((max * (3 - i)) / 3)}
                  </text>
                </g>
              ))}
              <path
                d={`${line} L680,220 L52,220 Z`}
                fill={`url(#${gradient})`}
              />
              <path
                d={line}
                stroke="var(--data-accent)"
                strokeWidth="2.5"
                fill="none"
                strokeLinejoin="round"
              />
              {points.map((point, i) => (
                <g key={i}>
                  <text
                    x={point.x}
                    y="250"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="10"
                  >
                    {period === "reference"
                      ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]
                      : i === 0
                        ? "Inicio"
                        : `Op. ${i}`}
                  </text>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hovered === i ? 5 : 3}
                    fill="var(--data-accent)"
                    opacity={hovered === i ? 1 : 0.6}
                  />
                  <rect
                    x={point.x - 22}
                    y="20"
                    width="44"
                    height="205"
                    fill="transparent"
                    tabIndex={0}
                    role="button"
                    aria-label={`${period === "reference" ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][i] : `Operación ${i}`}: ${format(point.value)}`}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setHovered(hovered === i ? null : i)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setHovered(hovered === i ? null : i);
                      }
                    }}
                  />
                </g>
              ))}
            </svg>
            {hovered !== null && points[hovered] ? (
              <div className={styles.chartTooltip}>
                {format(points[hovered].value)}
              </div>
            ) : null}
          </div>
        </section>
        <section
          className={styles.breakdown}
          aria-labelledby={`${gradient}-breakdown`}
        >
          <div className={styles.panelHeading}>
            <div>
              <WrittenHeading id={`${gradient}-breakdown`}>
                {breakdownTitle}
              </WrittenHeading>
              <p>Estado actual de la demo</p>
            </div>
            <DashboardIcon name="chart" />
          </div>
          <div className={styles.segments}>
            {segments.map((segment, i) => (
              <div key={segment.label}>
                <div>
                  <span>{segment.label}</span>
                  <strong>
                    {segment.value}
                    <small>
                      {total ? Math.round((segment.value / total) * 100) : 0}%
                    </small>
                  </strong>
                </div>
                <div className={styles.track}>
                  <span
                    style={{
                      width: `${total ? (segment.value / total) * 100 : 0}%`,
                      background:
                        segment.color ??
                        ["var(--data-accent)", "#6cddac", "#bda6fa", "#eac07e"][
                          i % 4
                        ],
                    }}
                  />
                </div>
              </div>
            ))}
            {!total ? (
              <p className={styles.breakdownEmpty}>
                Las operaciones que simules aparecerán aquí.
              </p>
            ) : null}
          </div>
          <div className={styles.breakdownTotal}>
            <span>
              Total{" "}
              {kind === "tienda"
                ? "de unidades"
                : kind === "restaurante"
                  ? "de pedidos"
                  : "de pacientes"}
            </span>
            <strong>{total}</strong>
          </div>
        </section>
      </div>
    </section>
  );
}
