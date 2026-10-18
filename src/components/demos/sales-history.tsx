import { useState, type FormEvent } from "react";
import { money } from "./demo-data";
import {
  refundCents,
  returnedQuantity,
  type Sale,
  type SaleLine,
} from "./commerce-model";

function ReturnLine({
  sale,
  line,
  onReturn,
}: {
  sale: Sale;
  line: SaleLine;
  onReturn: (
    saleId: number,
    lineKey: string,
    quantity: number,
    restock: boolean,
  ) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [restock, setRestock] = useState(true);
  const returned = returnedQuantity(sale, line.key);
  const remaining = line.quantity - returned;
  const selectedQuantity = Math.min(quantity, remaining);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedQuantity > 0)
      onReturn(sale.id, line.key, selectedQuantity, restock);
  }
  return (
    <form
      className="demo-return-line"
      onSubmit={submit}
      aria-label={`Devolver ${line.name}`}
    >
      <div>
        <h4>{line.name}</h4>
        <p>
          {line.quantity} vendidas · {returned} devueltas
        </p>
        <p>
          Importe pagado: <strong>{money(line.netCents)}</strong>
        </p>
      </div>
      {remaining ? (
        <div className="demo-form-stack">
          <label>
            Cantidad a devolver de {line.name}
            <select
              value={selectedQuantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            >
              {Array.from({ length: remaining }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="demo-check">
            <input
              type="checkbox"
              checked={restock}
              onChange={(event) => setRestock(event.target.checked)}
            />
            Reincorporar {line.name} al stock
          </label>
          <p>
            Reembolso simulado:{" "}
            <strong>
              {money(refundCents(line, returned, selectedQuantity))}
            </strong>
          </p>
          <button type="submit" className="button button-text">
            Devolver {selectedQuantity}{" "}
            {selectedQuantity === 1 ? "unidad" : "unidades"} de {line.name}
          </button>
        </div>
      ) : (
        <p className="demo-complete">
          Todas las unidades de este producto fueron devueltas.
        </p>
      )}
    </form>
  );
}

export function SalesHistory({
  sales,
  onReturn,
}: {
  sales: Sale[];
  onReturn: (
    saleId: number,
    lineKey: string,
    quantity: number,
    restock: boolean,
  ) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = sales.find((sale) => sale.id === selectedId) ?? sales.at(-1);
  if (!selected) return null;
  const refunded = selected.returns.reduce((sum, item) => sum + item.cents, 0);
  return (
    <section
      className="demo-sales-history"
      aria-label="Ventas y devoluciones de prueba"
    >
      <div className="workspace-heading">
        <h3>Ventas y devoluciones</h3>
        <span className="badge">{sales.length} ventas en esta sesión</span>
      </div>
      <p>
        Prueba una devolución total o parcial. Si el producto está dañado,
        desmarca la reposición al stock.
      </p>
      <label className="demo-sale-picker">
        Venta a consultar
        <select
          value={selected.id}
          onChange={(event) => setSelectedId(Number(event.target.value))}
        >
          {sales.map((sale) => (
            <option key={sale.id} value={sale.id}>
              Venta {String(sale.id).padStart(3, "0")} · {money(sale.total)}
            </option>
          ))}
        </select>
      </label>
      <div className="demo-sale-summary">
        <span>
          Pagado: <strong>{money(selected.total)}</strong>
        </span>
        <span>
          Devuelto: <strong>{money(refunded)}</strong>
        </span>
        <span>
          Neto: <strong>{money(selected.total - refunded)}</strong>
        </span>
      </div>
      <div className="demo-return-list">
        {selected.lines.map((line) => (
          <ReturnLine
            key={`${selected.id}-${line.key}`}
            sale={selected}
            line={line}
            onReturn={onReturn}
          />
        ))}
      </div>
      {selected.returns.length ? (
        <div className="demo-return-history">
          <h4>Devoluciones registradas</h4>
          <ul>
            {selected.returns.map((entry) => (
              <li key={entry.id}>
                {
                  selected.lines.find((line) => line.key === entry.lineKey)
                    ?.name
                }{" "}
                × {entry.quantity}: {money(entry.cents)} ·{" "}
                {entry.restock
                  ? "Reincorporado al stock"
                  : "Sin reposición al stock"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
