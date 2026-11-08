import { useState } from "react";
import { money, type DemoItem } from "./demo-data";
import type { Appointment } from "./veterinary-model";
import { WrittenHeading } from "../landing/written-heading";

export function InventoryView({
  items,
  stock,
  replenish,
}: {
  items: DemoItem[];
  stock: Record<string, number>;
  replenish: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const visible = items.filter(
    (item) =>
      item.name
        .toLocaleLowerCase("es")
        .includes(query.trim().toLocaleLowerCase("es")) &&
      (filter === "Todos" ||
        (filter === "Agotados" ? stock[item.id] === 0 : stock[item.id] <= 3)),
  );
  return (
    <section className="inventory-module" aria-label="Control de inventario">
      <div className="demo-filters">
        <label>
          Buscar en inventario
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre del producto"
          />
        </label>
        <label>
          Disponibilidad
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option>Todos</option>
            <option>Stock bajo</option>
            <option>Agotados</option>
          </select>
        </label>
      </div>
      <div className="module-table-wrap">
        <table className="module-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Existencias</th>
              <th>Estado</th>
              <th>Reposición</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.category}</small>
                </td>
                <td>{money(item.cents)}</td>
                <td>{stock[item.id]} unidades disponibles</td>
                <td>
                  <span
                    className={
                      stock[item.id] <= 3 ? "demo-stock-low" : "demo-stock"
                    }
                  >
                    {stock[item.id] === 0
                      ? "Agotado"
                      : stock[item.id] <= 3
                        ? "Stock bajo"
                        : "Disponible"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="button button-text"
                    aria-label={`Reponer cinco unidades de ${item.name}`}
                    onClick={() => replenish(item.id)}
                  >
                    Reponer +5
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length ? (
        <p className="empty-state">No hay productos con estos filtros.</p>
      ) : null}
      <div className="module-note">
        <WrittenHeading as="h3">
          Un inventario que acompaña tus ventas.
        </WrittenHeading>
        <p>
          Las ventas descuentan unidades. Las devoluciones pueden
          reincorporarlas y cada reposición se conserva al cambiar de módulo.
        </p>
      </div>
    </section>
  );
}

export function TablesView({
  orders,
  selected,
  onSelect,
  onTakeaway,
}: {
  orders: { service: string; step: number }[];
  selected: string;
  onSelect: (table: string) => void;
  onTakeaway: () => void;
}) {
  return (
    <section className="tables-module" aria-label="Distribución de mesas">
      <div className="module-section-heading">
        <WrittenHeading>Un lugar para cada servicio.</WrittenHeading>
        <span className="badge">6 mesas en la demo</span>
      </div>
      <div className="table-grid">
        {Array.from({ length: 6 }, (_, index) => {
          const name = `Mesa ${index + 1}`;
          const active = orders.filter(
            (order) => order.service === name && order.step < 3,
          );
          return (
            <button
              type="button"
              className="table-card"
              key={name}
              onClick={() => onSelect(name)}
              aria-label={`Preparar pedido para ${name}`}
              data-selected={selected === name}
            >
              <span className="table-map" aria-hidden="true">
                <i />
                <b>{String(index + 1).padStart(2, "0")}</b>
                <i />
              </span>
              <strong>{name}</strong>
              <span className={active.length ? "demo-stock-low" : "demo-stock"}>
                {active.length
                  ? `${active.length} pedido(s) en curso`
                  : "Disponible"}
              </span>
              <small>Preparar pedido</small>
            </button>
          );
        })}
      </div>
      <div className="module-note">
        <div>
          <WrittenHeading as="h3">¿El pedido es para llevar?</WrittenHeading>
          <p>Prepara el mismo pedido sin asignar una mesa.</p>
        </div>
        <button className="button button-primary" onClick={onTakeaway}>
          Preparar para llevar
        </button>
      </div>
    </section>
  );
}

export function PatientDirectory({
  appointments,
  onSelect,
}: {
  appointments: Appointment[];
  onSelect: (appointment: Appointment) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = appointments.filter((item) =>
    `${item.name} ${item.owner}`
      .toLocaleLowerCase("es")
      .includes(query.trim().toLocaleLowerCase("es")),
  );
  return (
    <section className="patient-directory" aria-label="Directorio de pacientes">
      <label className="directory-search">
        Buscar paciente o responsable
        <input
          type="search"
          placeholder="Nombre de la mascota o responsable"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="patient-grid">
        {visible.map((item) => (
          <article
            className="patient-card"
            key={item.id}
            aria-label={`Paciente ${item.name}`}
          >
            <span className="patient-avatar" aria-hidden="true">
              {item.name.slice(0, 1)}
            </span>
            <div>
              <h3>{item.name}</h3>
              <p>{item.owner}</p>
            </div>
            <dl>
              <div>
                <dt>Servicio</dt>
                <dd>{item.service}</dd>
              </div>
              <div>
                <dt>Notas en ficha</dt>
                <dd>{item.notes.length}</dd>
              </div>
              <div>
                <dt>Recordatorios</dt>
                <dd>{item.reminders.length}</dd>
              </div>
            </dl>
            <button
              className="button button-text"
              aria-label={`Ver ficha de ${item.name}`}
              onClick={() => onSelect(item)}
            >
              Abrir ficha
            </button>
          </article>
        ))}
      </div>
      {!visible.length ? (
        <p className="empty-state">No hay pacientes con esa búsqueda.</p>
      ) : null}
    </section>
  );
}
