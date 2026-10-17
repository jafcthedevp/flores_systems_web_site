export type DemoItem = {
  id: string;
  name: string;
  detail: string;
  cents: number;
  category: string;
  stock?: number;
};

export const products: DemoItem[] = [
  {
    id: "arroz",
    name: "Arroz 1 kg",
    detail: "Grano extra",
    cents: 550,
    category: "Despensa",
    stock: 24,
  },
  {
    id: "leche",
    name: "Leche 400 g",
    detail: "Leche evaporada",
    cents: 420,
    category: "Despensa",
    stock: 18,
  },
  {
    id: "aceite",
    name: "Aceite 1 L",
    detail: "Aceite vegetal",
    cents: 990,
    category: "Despensa",
    stock: 3,
  },
  {
    id: "agua",
    name: "Agua 625 ml",
    detail: "Sin gas",
    cents: 250,
    category: "Bebidas",
    stock: 0,
  },
  {
    id: "jugo",
    name: "Jugo de naranja 1 L",
    detail: "Botella familiar",
    cents: 750,
    category: "Bebidas",
    stock: 8,
  },
];
export const dishes: DemoItem[] = [
  {
    id: "menu",
    name: "Menú del día",
    detail: "Entrada + plato de fondo",
    cents: 1600,
    category: "Platos",
  },
  {
    id: "saltado",
    name: "Lomo saltado",
    detail: "Con arroz y papas",
    cents: 2800,
    category: "Platos",
  },
  {
    id: "limonada",
    name: "Limonada",
    detail: "Vaso de 450 ml",
    cents: 700,
    category: "Bebidas",
  },
  {
    id: "causa",
    name: "Causa limeña",
    detail: "Porción de entrada",
    cents: 1200,
    category: "Entradas",
  },
  {
    id: "chicha",
    name: "Chicha morada",
    detail: "Jarra de 1 L",
    cents: 1400,
    category: "Bebidas",
  },
];
export const money = (cents: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    cents / 100,
  );
