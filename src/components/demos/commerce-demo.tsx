import { useState } from "react";
import { dishes, money, products, type DemoItem } from "./demo-data";

type Line = { name: string; quantity: number; cents: number };
type Sale = {
  id: number;
  lines: Line[];
  total: number;
  payment: string;
  change: number;
};
type Order = {
  id: number;
  lines: Line[];
  total: number;
  service: string;
  note: string;
  step: number;
};
const stages = ["Recibido", "En cocina", "Listo", "Entregado"];
const nextStage = ["Pasar a cocina", "Marcar listo", "Marcar entregado"];

export function CommerceDemo({ kind }: { kind: "tienda" | "restaurante" }) {
  const shop = kind === "tienda";
  const items = shop ? products : dishes;
  const [cart, setCart] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((item) => [item.id, item.stock ?? 0])),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [payment, setPayment] = useState("Efectivo");
  const [cash, setCash] = useState("");
  const [service, setService] = useState("En mesa");
  const [table, setTable] = useState("Mesa 1");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const total = items.reduce(
    (sum, item) => sum + item.cents * (cart[item.id] || 0),
    0,
  );
  const received = Math.round(Number(cash) * 100);
  const visible = items.filter(
    (item) =>
      (category === "Todas" || item.category === category) &&
      item.name
        .toLocaleLowerCase("es")
        .includes(search.trim().toLocaleLowerCase("es")),
  );
  const lastSale = sales.at(-1);

  function add(item: DemoItem) {
    setCart((current) => ({
      ...current,
      [item.id]: shop
        ? Math.min(stock[item.id], (current[item.id] || 0) + 1)
        : (current[item.id] || 0) + 1,
    }));
    setMessage("");
  }
  function finish() {
    if (!total) return;
    const lines = items
      .filter((item) => cart[item.id])
      .map((item) => ({
        name: item.name,
        quantity: cart[item.id],
        cents: item.cents,
      }));
    if (shop) {
      if (items.some((item) => (cart[item.id] || 0) > stock[item.id])) {
        setMessage(
          "No hay stock suficiente. Reduce la cantidad o repón el producto.",
        );
        return;
      }
      if (
        payment === "Efectivo" &&
        (!Number.isFinite(received) || received < total)
      ) {
        setMessage(
          "El monto recibido no alcanza para completar la venta. Prueba con pago exacto.",
        );
        return;
      }
      setSales((current) => [
        ...current,
        {
          id: current.length + 1,
          lines,
          total,
          payment,
          change: payment === "Efectivo" ? received - total : 0,
        },
      ]);
      setStock((current) =>
        Object.fromEntries(
          Object.entries(current).map(([id, amount]) => [
            id,
            amount - (cart[id] || 0),
          ]),
        ),
      );
      setCash("");
      setMessage(
        "Simulación completada. La venta y el stock se actualizaron solo en esta demo; no hubo ningún cobro.",
      );
    } else {
      setOrders((current) => [
        ...current,
        {
          id: current.length + 1,
          lines,
          total,
          service: service === "En mesa" ? table : "Para llevar",
          note: note.trim(),
          step: 0,
        },
      ]);
      setNote("");
      setMessage(
        "Simulación completada. Sigue el pedido hasta la entrega en el tablero de prueba.",
      );
    }
    setCart({});
  }
  return (
    <>
      <div className="workspace-heading">
        <h2>{shop ? "Venta de ejemplo" : "Carta de ejemplo"}</h2>
        <span className="badge">
          {shop
            ? `${sales.length} ventas simuladas`
            : `${orders.filter((order) => order.step < 3).length} pedidos en curso`}
        </span>
      </div>
      <p className="demo-hint">
        {shop
          ? "Prueba un producto agotado, repón unidades y calcula el vuelto de una venta."
          : "Arma un pedido, añade indicaciones y acompáñalo desde cocina hasta la entrega."}
      </p>
      <p className="demo-feedback" role="status">
        {message}
      </p>
      <div className="demo-columns">
        <div>
          <div className="demo-filters">
            <label>
              Buscar {shop ? "producto" : "plato"}
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Categoría
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {["Todas", ...new Set(items.map((item) => item.category))].map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </label>
          </div>
          <div className="demo-products">
            {visible.map((item) => (
              <article key={item.id} aria-label={item.name}>
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
                <strong>{money(item.cents)}</strong>
                {shop ? (
                  <span
                    className={
                      stock[item.id] <= 3 ? "demo-stock-low" : "demo-stock"
                    }
                  >
                    {stock[item.id]
                      ? `${stock[item.id]} unidades disponibles`
                      : "Agotado"}
                  </span>
                ) : null}
                <button
                  className="button button-text"
                  disabled={shop && (cart[item.id] || 0) >= stock[item.id]}
                  onClick={() => add(item)}
                >
                  Agregar {item.name}
                </button>
                {shop ? (
                  <button
                    className="demo-restock"
                    aria-label={`Reponer cinco unidades de ${item.name}`}
                    onClick={() => {
                      setStock((current) => ({
                        ...current,
                        [item.id]: current[item.id] + 5,
                      }));
                      setMessage(
                        `Se añadieron 5 unidades de ${item.name} al inventario de prueba.`,
                      );
                    }}
                  >
                    Reponer +5
                  </button>
                ) : null}
              </article>
            ))}
          </div>
          {!visible.length ? (
            <p className="empty-state">
              No hay resultados. Prueba otra búsqueda o categoría.
            </p>
          ) : null}
        </div>
        <aside
          className="demo-panel demo-cart"
          aria-label={shop ? "Caja de prueba" : "Pedido de prueba"}
        >
          <h3>{shop ? "Resumen de venta" : "Pedido de ejemplo"}</h3>
          {items
            .filter((item) => cart[item.id])
            .map((item) => (
              <div className="cart-line" key={item.id}>
                <span>
                  {item.name}
                  <small>{money(item.cents * cart[item.id])}</small>
                </span>
                <div className="demo-quantity">
                  <button
                    aria-label={`Quitar una unidad de ${item.name}`}
                    onClick={() =>
                      setCart((current) => ({
                        ...current,
                        [item.id]: Math.max(0, current[item.id] - 1),
                      }))
                    }
                  >
                    −
                  </button>
                  <span>{cart[item.id]}</span>
                  <button
                    aria-label={`Aumentar unidades de ${item.name}`}
                    disabled={shop && cart[item.id] >= stock[item.id]}
                    onClick={() => add(item)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          {!total ? (
            <p>Agrega un {shop ? "producto" : "plato"} para probar el flujo.</p>
          ) : null}
          <p className="demo-total">Total: {money(total)}</p>
          <div className="demo-form-stack">
            {shop ? (
              <>
                <label>
                  Medio de pago
                  <select
                    value={payment}
                    onChange={(event) => setPayment(event.target.value)}
                  >
                    {["Efectivo", "Yape simulado", "Tarjeta simulada"].map(
                      (value) => (
                        <option key={value}>{value}</option>
                      ),
                    )}
                  </select>
                </label>
                {payment === "Efectivo" ? (
                  <>
                    <label>
                      Monto recibido (S/)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={cash}
                        onChange={(event) => setCash(event.target.value)}
                      />
                    </label>
                    <button
                      className="button button-text"
                      disabled={!total}
                      onClick={() => setCash((total / 100).toFixed(2))}
                    >
                      Pago exacto
                    </button>
                    <p>
                      Vuelto:{" "}
                      <strong>
                        {money(
                          Math.max(
                            0,
                            Number.isFinite(received) ? received - total : 0,
                          ),
                        )}
                      </strong>
                    </p>
                  </>
                ) : (
                  <p>Pago de prueba, sin conexión a una pasarela.</p>
                )}
              </>
            ) : (
              <>
                <label>
                  Tipo de servicio
                  <select
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                  >
                    <option>En mesa</option>
                    <option>Para llevar</option>
                  </select>
                </label>
                {service === "En mesa" ? (
                  <label>
                    Mesa
                    <select
                      value={table}
                      onChange={(event) => setTable(event.target.value)}
                    >
                      {Array.from({ length: 6 }, (_, index) => (
                        <option key={index}>Mesa {index + 1}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <label>
                  Notas del pedido
                  <textarea
                    maxLength={160}
                    rows={2}
                    placeholder="Ej.: sin cebolla"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
              </>
            )}
          </div>
          <div className="demo-button-row">
            <button
              className="button button-primary"
              disabled={!total}
              onClick={finish}
            >
              Simular {shop ? "venta" : "pedido"}
            </button>
            <button
              className="button button-text"
              disabled={!total}
              onClick={() => {
                setCart({});
                setCash("");
                setNote("");
                setMessage("");
              }}
            >
              Vaciar
            </button>
          </div>
        </aside>
      </div>
      {shop && lastSale ? (
        <section className="demo-receipt" aria-label="Última venta simulada">
          <div>
            <h3>Venta simulada {String(lastSale.id).padStart(3, "0")}</h3>
            {lastSale.lines.map((line) => (
              <p key={line.name}>
                {line.name} × {line.quantity} ·{" "}
                {money(line.cents * line.quantity)}
              </p>
            ))}
            <strong>Total: {money(lastSale.total)}</strong>
            <p>
              {lastSale.payment}
              {lastSale.payment === "Efectivo"
                ? ` · Vuelto: ${money(lastSale.change)}`
                : ""}
            </p>
          </div>
          <div>
            <span>Acumulado de esta sesión</span>
            <p className="demo-total">
              {money(sales.reduce((sum, sale) => sum + sale.total, 0))}
            </p>
            <small>Comprobante de demostración, sin valor fiscal.</small>
          </div>
        </section>
      ) : null}
      {!shop ? (
        <section className="demo-orders">
          <h3>Seguimiento de pedidos</h3>
          {!orders.length ? (
            <p>
              Tu primer pedido aparecerá aquí. Luego podrás pasarlo a cocina y
              entregarlo.
            </p>
          ) : (
            <div className="demo-order-grid">
              {orders.map((order) => (
                <article
                  className="demo-panel"
                  key={order.id}
                  aria-label={`Pedido ${String(order.id).padStart(3, "0")}`}
                >
                  <div className="workspace-heading">
                    <h4>Pedido {String(order.id).padStart(3, "0")}</h4>
                    <span className="badge">{stages[order.step]}</span>
                  </div>
                  <p>{order.service}</p>
                  {order.lines.map((line) => (
                    <p key={line.name}>
                      {line.quantity} × {line.name}
                    </p>
                  ))}
                  {order.note ? (
                    <p className="demo-order-note preserve-text">
                      {order.note}
                    </p>
                  ) : null}
                  <strong>{money(order.total)}</strong>
                  {order.step < 3 ? (
                    <button
                      className="button button-text"
                      onClick={() => {
                        setOrders((current) =>
                          current.map((item) =>
                            item.id === order.id
                              ? { ...item, step: item.step + 1 }
                              : item,
                          ),
                        );
                        setMessage(
                          `Pedido ${String(order.id).padStart(3, "0")}: ${stages[order.step + 1]}.`,
                        );
                      }}
                    >
                      {nextStage[order.step]}
                    </button>
                  ) : (
                    <p className="demo-complete">
                      Pedido completado en la demo.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
