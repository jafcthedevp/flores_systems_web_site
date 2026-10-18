import { describe, expect, it } from "vitest";
import {
  cartEntry,
  refundCents,
  saleAmounts,
  saleLines,
} from "../src/components/demos/commerce-model";
import { dishes, products } from "../src/components/demos/demo-data";

describe("ventas de demostración", () => {
  it("mantiene separadas las combinaciones y conserva el precio elegido al añadirlas", () => {
    const dish = dishes.find((item) => item.id === "saltado")!;
    const choices = { preparation: "sin-cebolla", extra: "huevo" };
    const custom = cartEntry(dish, choices);
    const regular = cartEntry(dish);
    choices.extra = "carne";
    expect(custom.key).not.toBe(regular.key);
    expect(custom.cents).toBe(3150);
    expect(custom.modifiers.map((option) => option.label)).toEqual([
      "Sin cebolla",
      "Huevo frito",
    ]);
    expect(regular.cents).toBe(2800);
    expect(regular.modifiers).toEqual([]);
  });

  for (const discount of [0, 5, 10, 15, 20]) {
    it(`reembolsa exactamente lo pagado al devolver por partes una venta con ${discount}%`, () => {
      const cart = [
        { ...cartEntry(products[0]), quantity: 3 },
        { ...cartEntry(products[1]), quantity: 2 },
      ];
      const amounts = saleAmounts(cart, discount);
      const lines = saleLines(cart, amounts.total);
      expect(amounts.subtotal).toBe(2490);
      expect(amounts.total + amounts.discountCents).toBe(amounts.subtotal);
      let refunded = 0;
      for (const line of lines) {
        const first = refundCents(line, 0, 1);
        const rest = refundCents(line, 1, line.quantity - 1);
        expect(first + rest).toBe(line.netCents);
        expect(first).toBeGreaterThanOrEqual(0);
        expect(line.netCents).toBeLessThanOrEqual(line.cents * line.quantity);
        refunded += first + rest;
      }
      expect(refunded).toBe(amounts.total);
    });
  }
});
