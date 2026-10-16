"use client";
import { useState } from "react";
type Item = { id: string; name: string; detail: string; price: number };
const products: Item[] = [
  {
    id: "arroz",
    name: "Arroz 1 kg",
    detail: "Despensa · 24 unidades",
    price: 5.5,
  },
  {
    id: "leche",
    name: "Leche 400 g",
    detail: "Despensa · 18 unidades",
    price: 4.2,
  },
  {
    id: "aceite",
    name: "Aceite 1 L",
    detail: "Despensa · 12 unidades",
    price: 9.9,
  },
];
const dishes: Item[] = [
  {
    id: "menu",
    name: "Menú del día",
    detail: "Entrada + plato de fondo",
    price: 16,
  },
  {
    id: "saltado",
    name: "Lomo saltado",
    detail: "Con arroz y papas",
    price: 28,
  },
  { id: "limonada", name: "Limonada", detail: "Vaso de 450 ml", price: 7 },
];
const money = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );
export function BusinessDemo({
  kind,
}: {
  kind: "tienda" | "veterinaria" | "restaurante";
}) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: "Luna",
      owner: "Cliente de ejemplo A",
      time: "09:30",
      done: false,
    },
    {
      id: 2,
      name: "Toby",
      owner: "Cliente de ejemplo B",
      time: "10:15",
      done: false,
    },
    {
      id: 3,
      name: "Milo",
      owner: "Cliente de ejemplo C",
      time: "11:00",
      done: true,
    },
  ]);
  if (kind === "veterinaria")
    return (
      <div className="demo-workspace">
        <div className="workspace-heading">
          <h2>Agenda de ejemplo</h2>
          <span>
            {appointments.filter((item) => !item.done).length} citas pendientes
          </span>
        </div>
        <label>
          Buscar mascota
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
          />
        </label>
        <div className="request-list">
          {appointments
            .filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase()),
            )
            .map((item) => (
              <article key={item.id}>
                <div>
                  <strong>
                    {item.time} · {item.name}
                  </strong>
                  <p>{item.owner}</p>
                  <span className="badge">
                    {item.done ? "Atendido" : "Pendiente"}
                  </span>
                </div>
                <button
                  className="button button-text"
                  onClick={() =>
                    setAppointments((items) =>
                      items.map((current) =>
                        current.id === item.id
                          ? { ...current, done: !current.done }
                          : current,
                      ),
                    )
                  }
                >
                  {item.done ? "Volver a pendiente" : "Marcar atendido"}
                </button>
              </article>
            ))}
        </div>
        {!appointments.some((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ) ? (
          <p role="status">
            No hay mascotas con ese nombre. Prueba otra búsqueda.
          </p>
        ) : null}
      </div>
    );
  const items = kind === "tienda" ? products : dishes;
  const total = items.reduce(
    (sum, item) => sum + item.price * (cart[item.id] || 0),
    0,
  );
  return (
    <div className="demo-workspace">
      <h2>{kind === "tienda" ? "Venta de ejemplo" : "Carta de ejemplo"}</h2>
      <label>
        Buscar {kind === "tienda" ? "producto" : "plato"}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="demo-products">
        {items
          .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((item) => (
            <article key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
              <strong>{money(item.price)}</strong>
              <button
                className="button button-text"
                onClick={() => {
                  setMessage("");
                  setCart((current) => ({
                    ...current,
                    [item.id]: (current[item.id] || 0) + 1,
                  }));
                }}
              >
                Agregar {item.name}
              </button>
            </article>
          ))}
      </div>
      {!items.some((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      ) ? (
        <p role="status">No hay resultados. Prueba otra búsqueda.</p>
      ) : null}
      <aside className="demo-cart">
        <h3>{kind === "tienda" ? "Resumen de venta" : "Pedido de ejemplo"}</h3>
        {items
          .filter((item) => cart[item.id])
          .map((item) => (
            <div className="cart-line" key={item.id}>
              <span>
                {item.name} × {cart[item.id]}
              </span>
              <button
                aria-label={`Quitar una unidad de ${item.name}`}
                onClick={() =>
                  setCart((current) => ({
                    ...current,
                    [item.id]: Math.max(0, current[item.id] - 1),
                  }))
                }
              >
                Quitar una unidad
              </button>
            </div>
          ))}
        {total === 0 ? <p>Agrega un producto para probar el flujo.</p> : null}
        <p className="demo-total">Total: {money(total)}</p>
        <button
          className="button button-primary"
          disabled={total === 0}
          onClick={() => {
            setMessage(
              "Simulación completada. No se realizó ningún pedido, cobro ni cambio de inventario.",
            );
            setCart({});
          }}
        >
          Simular {kind === "tienda" ? "venta" : "pedido"}
        </button>
        <button
          className="button button-text"
          disabled={!total}
          onClick={() => {
            setCart({});
            setMessage("");
          }}
        >
          Vaciar
        </button>
        <p role="status">{message}</p>
      </aside>
    </div>
  );
}
