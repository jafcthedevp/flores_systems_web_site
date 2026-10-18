import type { DemoItem, DemoModifier } from "./demo-data";

export type CartEntry = {
  key: string;
  itemId: string;
  name: string;
  cents: number;
  quantity: number;
  modifiers: DemoModifier[];
};
export type SaleLine = CartEntry & { netCents: number };
export type SaleReturn = {
  id: number;
  lineKey: string;
  quantity: number;
  cents: number;
  restock: boolean;
};
export type Sale = {
  id: number;
  lines: SaleLine[];
  subtotal: number;
  discountPercent: number;
  discountCents: number;
  total: number;
  payment: string;
  change: number;
  returns: SaleReturn[];
};

export function cartEntry(
  item: DemoItem,
  choices: Record<string, string> = {},
): CartEntry {
  const options = (item.modifierGroups ?? []).map(
    (group) =>
      group.options.find((option) => option.id === choices[group.id]) ??
      group.options[0],
  );
  return {
    key: [item.id, ...options.map((option) => option.id)].join("--"),
    itemId: item.id,
    name: item.name,
    cents: item.cents + options.reduce((sum, option) => sum + option.cents, 0),
    quantity: 1,
    modifiers: options.filter((option) => option.showOnTicket),
  };
}

export function saleAmounts(entries: CartEntry[], discountPercent: number) {
  const subtotal = entries.reduce(
    (sum, entry) => sum + entry.cents * entry.quantity,
    0,
  );
  const discountCents = Math.round((subtotal * discountPercent) / 100);
  return { subtotal, discountCents, total: subtotal - discountCents };
}

// Allocate the discounted total cumulatively so every cent belongs to a line.
export function saleLines(entries: CartEntry[], total: number): SaleLine[] {
  const subtotal = entries.reduce(
    (sum, entry) => sum + entry.cents * entry.quantity,
    0,
  );
  let grossSoFar = 0;
  let netSoFar = 0;
  return entries.map((entry) => {
    grossSoFar += entry.cents * entry.quantity;
    const nextNet = subtotal ? Math.round((grossSoFar * total) / subtotal) : 0;
    const netCents = nextNet - netSoFar;
    netSoFar = nextNet;
    return { ...entry, netCents };
  });
}

export function returnedQuantity(sale: Sale, lineKey: string) {
  return sale.returns.reduce(
    (sum, entry) => sum + (entry.lineKey === lineKey ? entry.quantity : 0),
    0,
  );
}

export function refundCents(
  line: SaleLine,
  alreadyReturned: number,
  quantity: number,
) {
  return (
    Math.round((line.netCents * (alreadyReturned + quantity)) / line.quantity) -
    Math.round((line.netCents * alreadyReturned) / line.quantity)
  );
}
