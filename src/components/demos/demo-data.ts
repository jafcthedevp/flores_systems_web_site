export type DemoModifier = {
  id: string;
  label: string;
  cents: number;
  showOnTicket?: boolean;
};
type ModifierGroup = { id: string; label: string; options: DemoModifier[] };

export type DemoItem = {
  id: string;
  name: string;
  detail: string;
  cents: number;
  category: string;
  stock?: number;
  modifierGroups?: ModifierGroup[];
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
    modifierGroups: [
      {
        id: "side",
        label: "Acompañamiento",
        options: [
          { id: "arroz", label: "Arroz", cents: 0, showOnTicket: true },
          { id: "ensalada", label: "Ensalada", cents: 0, showOnTicket: true },
          {
            id: "papas",
            label: "Papas fritas",
            cents: 200,
            showOnTicket: true,
          },
        ],
      },
    ],
  },
  {
    id: "saltado",
    name: "Lomo saltado",
    detail: "Con arroz y papas",
    cents: 2800,
    category: "Platos",
    modifierGroups: [
      {
        id: "preparation",
        label: "Preparación",
        options: [
          { id: "original", label: "Receta original", cents: 0 },
          {
            id: "sin-cebolla",
            label: "Sin cebolla",
            cents: 0,
            showOnTicket: true,
          },
          {
            id: "sin-tomate",
            label: "Sin tomate",
            cents: 0,
            showOnTicket: true,
          },
        ],
      },
      {
        id: "extra",
        label: "Adicional",
        options: [
          { id: "ninguno", label: "Sin adicional", cents: 0 },
          { id: "huevo", label: "Huevo frito", cents: 350, showOnTicket: true },
          {
            id: "carne",
            label: "Extra de carne",
            cents: 700,
            showOnTicket: true,
          },
        ],
      },
    ],
  },
  {
    id: "limonada",
    name: "Limonada",
    detail: "Vaso de 450 ml",
    cents: 700,
    category: "Bebidas",
    modifierGroups: [
      {
        id: "sugar",
        label: "Azúcar",
        options: [
          { id: "normal", label: "Normal", cents: 0 },
          { id: "poca", label: "Poca azúcar", cents: 0, showOnTicket: true },
          { id: "sin", label: "Sin azúcar", cents: 0, showOnTicket: true },
        ],
      },
    ],
  },
  {
    id: "causa",
    name: "Causa limeña",
    detail: "Porción de entrada",
    cents: 1200,
    category: "Entradas",
    modifierGroups: [
      {
        id: "preparation",
        label: "Preparación",
        options: [
          { id: "original", label: "Receta original", cents: 0 },
          { id: "sin-aji", label: "Sin ají", cents: 0, showOnTicket: true },
        ],
      },
    ],
  },
  {
    id: "chicha",
    name: "Chicha morada",
    detail: "Jarra de 1 L",
    cents: 1400,
    category: "Bebidas",
    modifierGroups: [
      {
        id: "sugar",
        label: "Azúcar",
        options: [
          { id: "normal", label: "Normal", cents: 0 },
          { id: "poca", label: "Poca azúcar", cents: 0, showOnTicket: true },
          { id: "sin", label: "Sin azúcar", cents: 0, showOnTicket: true },
        ],
      },
    ],
  },
];
export const money = (cents: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    cents / 100,
  );
