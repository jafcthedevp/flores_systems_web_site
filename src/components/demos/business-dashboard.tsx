"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CommerceDemo } from "./commerce-demo";
import { VeterinaryDemo } from "./veterinary-demo";
import { DashboardIcon } from "./dashboard-icon";
import styles from "./dashboard.module.css";
import { WrittenHeading } from "../landing/written-heading";

export type BusinessKind = "tienda" | "restaurante" | "veterinaria";
export type DashboardView =
  | "overview"
  | "catalog"
  | "inventory"
  | "checkout"
  | "history"
  | "tables"
  | "kitchen"
  | "agenda"
  | "patients"
  | "new-appointment"
  | "followup"
  | "guide";
const businesses = {
  tienda: {
    brand: "punto",
    label: "Tienda y bodega",
    description: "Tu comercio, bajo control",
    icon: "box",
  },
  restaurante: {
    brand: "mesa",
    label: "Restaurante",
    description: "Un servicio bien conectado",
    icon: "cart",
  },
  veterinaria: {
    brand: "nido",
    label: "Veterinaria",
    description: "Más tiempo para cuidar",
    icon: "heart",
  },
};
export function BusinessDashboard({ kind }: { kind: BusinessKind }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const [revision, setRevision] = useState(0);
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const vet = kind === "veterinaria";
  const shop = kind === "tienda";
  const business = businesses[kind];
  const navigation: [string, DashboardView, string][] = [
    ["Resumen", "overview", "grid"],
    [
      vet ? "Agenda" : shop ? "Punto de venta" : "Carta",
      vet ? "agenda" : "catalog",
      vet ? "calendar" : "cart",
    ],
    [
      vet ? "Pacientes" : shop ? "Inventario" : "Mesas y servicio",
      vet ? "patients" : shop ? "inventory" : "tables",
      vet ? "users" : "box",
    ],
    [
      vet ? "Nueva cita" : shop ? "Caja" : "Pedido actual",
      vet ? "new-appointment" : "checkout",
      vet ? "calendar" : "money",
    ],
    [
      vet ? "Seguimiento" : shop ? "Ventas y devoluciones" : "Cocina",
      vet ? "followup" : shop ? "history" : "kitchen",
      "chart",
    ],
    ["Guía de uso", "guide", "help"],
  ];
  const view = navigation[active][1];
  const descriptions: Record<DashboardView, string> = {
    overview: "Un vistazo a tu operación y a lo que necesita tu atención.",
    catalog: shop
      ? "Elige productos y prepara la venta. Tu selección se conserva al ir a caja."
      : "Personaliza los platos y prepara un pedido a tu medida.",
    inventory: "Consulta existencias, identifica faltantes y repón productos.",
    checkout: shop
      ? "Revisa la venta, aplica descuentos y simula el cobro."
      : "Revisa el pedido, elige el servicio y envíalo a cocina.",
    history:
      "Consulta cada venta y registra devoluciones con o sin reposición.",
    tables: "Consulta las mesas y prepara el servicio que vas a atender.",
    kitchen: "Sigue cada pedido desde la recepción hasta la entrega.",
    agenda: "Organiza las llegadas y acompaña cada atención de hoy.",
    patients: "Consulta las fichas, las notas y el historial de cada paciente.",
    "new-appointment":
      "Reserva un horario disponible y registra una nueva atención.",
    followup: "Prepara recordatorios y revisa el seguimiento de cada paciente.",
    guide: "Una guía breve para explorar las posibilidades de este sistema.",
  };
  function navigate(index: number) {
    setActive(index);
    setOpen(false);
  }
  function openView(next: DashboardView) {
    const index = navigation.findIndex(([, value]) => value === next);
    if (index >= 0) navigate(index);
  }
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const target = root.current?.querySelector<HTMLElement>("#module-title");
    target?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);
  useEffect(() => {
    if (!open) return;
    const sidebar = document.getElementById("dashboard-sidebar");
    sidebar?.querySelector<HTMLButtonElement>("nav button")?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menu.current?.focus();
      }
      if (event.key === "Tab" && sidebar) {
        const controls = [
          ...sidebar.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled])",
          ),
        ].filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <div
      ref={root}
      className={styles.dashboard}
      data-kind={kind}
      data-collapsed={collapsed}
      data-active-view={view}
    >
      <a className="skip-link" href="#dashboard-content">
        Ir al contenido
      </a>
      {open ? (
        <button
          className={styles.scrim}
          onClick={() => setOpen(false)}
          aria-label="Cerrar navegación"
        />
      ) : null}
      <aside
        className={styles.sidebar}
        data-open={open}
        aria-label="Navegación del sistema"
        id="dashboard-sidebar"
      >
        <Link
          className={styles.brand}
          href="/demos"
          aria-label={`${business.brand}, volver a las demos`}
        >
          <span className={styles.brandIcon}>
            <DashboardIcon name={business.icon} size={22} />
          </span>
          <span className={styles.sidebarLabel}>
            {business.brand}
            <small>by Flores Systems</small>
          </span>
        </Link>
        <div className={styles.businessIdentity}>
          <span className={styles.online} />
          <span className={styles.sidebarLabel}>
            {business.label}
            <small>Espacio de demostración</small>
          </span>
        </div>
        <span className={`${styles.navCaption} ${styles.sidebarLabel}`}>
          Tu espacio de trabajo
        </span>
        <nav aria-label="Módulos de la demo">
          {navigation.map(([label, , icon], index) => (
            <button
              type="button"
              key={label}
              title={label}
              onClick={() => navigate(index)}
              aria-current={active === index ? "location" : undefined}
              aria-controls="workspace-module"
            >
              <DashboardIcon name={icon} />
              <span className={styles.sidebarLabel}>{label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.support}>
            <DashboardIcon name="help" />
            <div className={styles.sidebarLabel}>
              <strong>Una solución a tu medida</strong>
              <p>Imagina este sistema en tu negocio.</p>
              <Link href="/#contacto">
                Solicitar cotización <DashboardIcon name="arrow" size={14} />
              </Link>
            </div>
          </div>
          <Link className={styles.backLink} href="/demos">
            <DashboardIcon name="grid" />
            <span className={styles.sidebarLabel}>Explorar otros negocios</span>
          </Link>
          <div className={styles.profile}>
            <span className={styles.avatar}>FS</span>
            <span className={styles.sidebarLabel}>
              <strong>Equipo de prueba</strong>
              <small>Acceso de demostración</small>
            </span>
          </div>
          <button
            className={styles.collapse}
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={
              collapsed ? "Expandir barra lateral" : "Contraer barra lateral"
            }
          >
            <DashboardIcon name="chevron" />
            <span className={styles.sidebarLabel}>Contraer</span>
          </button>
        </div>
      </aside>
      <div className={styles.body}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <button
              ref={menu}
              className={styles.mobileMenu}
              type="button"
              aria-label={
                open ? "Cerrar menú del sistema" : "Abrir menú del sistema"
              }
              aria-expanded={open}
              aria-controls="dashboard-sidebar"
              onClick={() => setOpen(!open)}
            >
              <DashboardIcon name={open ? "close" : "menu"} />
            </button>
            <span>{business.label}</span>
            <span aria-hidden="true">/</span>
            <strong>{navigation[active][0]}</strong>
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.sessionBadge}>
              <span className={styles.online} />
              Sesión de prueba
            </span>
            <select
              aria-label="Cambiar demo"
              value={kind}
              onChange={(event) => router.push(`/demos/${event.target.value}`)}
            >
              <option value="tienda">Tienda</option>
              <option value="restaurante">Restaurante</option>
              <option value="veterinaria">Veterinaria</option>
            </select>
            <span className={styles.avatar}>FS</span>
          </div>
        </header>
        <main id="dashboard-content" className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <p>{business.description}</p>
              <div tabIndex={-1} id="module-title">
                <WrittenHeading key={view} as="h1">
                  {view === "overview"
                    ? "Vista general"
                    : navigation[active][0]}
                </WrittenHeading>
              </div>
              <span>{descriptions[view]}</span>
            </div>
            <button
              className={styles.reset}
              type="button"
              onClick={() => setRevision((value) => value + 1)}
            >
              <DashboardIcon name="reset" size={16} />
              Reiniciar demo
            </button>
          </div>
          <div className={styles.demoNotice}>
            <span className={styles.noticeDot} />
            <span>
              Estás explorando una demo. Los datos son ficticios y las acciones
              se reinician al recargar.
            </span>
          </div>
          <div
            className="demo-workspace"
            data-view={view}
            id="workspace-module"
            role="region"
            aria-label={`Módulo ${navigation[active][0]}`}
          >
            {vet ? (
              <VeterinaryDemo
                key={`${kind}-${revision}`}
                view={view}
                onNavigate={openView}
              />
            ) : (
              <CommerceDemo
                key={`${kind}-${revision}`}
                kind={kind}
                view={view}
                onNavigate={openView}
              />
            )}
            {view === "guide" ? (
              <section className="workspace-guide">
                <div className={styles.sectionTitle}>
                  <DashboardIcon name="help" />
                  <div>
                    <h3>
                      {vet
                        ? "Recorre una atención completa"
                        : "Prueba una operación de principio a fin"}
                    </h3>
                    <p>Explora el sistema a tu ritmo.</p>
                  </div>
                </div>
                <div className={styles.guideSteps}>
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
                    <div key={title}>
                      <span>{i + 1}</span>
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
          <footer className={styles.footer}>
            <span>Flores Systems · Experiencias para negocios reales</span>
            <Link href="/#contacto">
              Hablemos de tu proyecto <DashboardIcon name="arrow" size={14} />
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
