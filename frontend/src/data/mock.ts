// src/data/mock.ts
export type Vendor = {
  id: string;
  name: string;
  location: string;     // cidade/UF ou “Interior do AM”
  type: "agricultor" | "artesao" | "extrativista" | "cooperativa";
  rating: number;       // 0..5
  avatar?: string;
  bio?: string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  unit: string;        // kg, peça, litro, etc
  category: "alimentos" | "artesanato" | "cosmeticos" | "bebidas" | "decoracao";
  image?: string;
  stock?: number;
  vendorId: string;
  tags?: string[];
  origin?: string;     // “Manaus/AM”, “Rio Preto da Eva/AM”, etc
};

export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "Sítio São Lucas",
    location: "Iranduba/AM",
    type: "agricultor",
    rating: 4.8,
    bio: "Produção familiar de frutas amazônicas, sem agrotóxicos."
  },
  {
    id: "v2",
    name: "Ateliê Rio Negro",
    location: "Manaus/AM",
    type: "artesao",
    rating: 4.6,
    bio: "Peças autorais com fibras naturais e madeira de manejo."
  },
  {
    id: "v3",
    name: "Coop. Andiroba Viva",
    location: "Manacapuru/AM",
    type: "cooperativa",
    rating: 4.9,
    bio: "Óleos e cosméticos de extrativismo sustentável."
  }
];

export const products: Product[] = [
  {
    id: "p1",
    title: "Açaí in natura (polpa 1L)",
    price: 18.90,
    unit: "litro",
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1542996966-2d6a6f3f0b39?q=80&w=1200&auto=format&fit=crop",
    vendorId: "v1",
    tags: ["açaí", "orgânico"],
    origin: "Iranduba/AM",
    stock: 120
  },
  {
    id: "p2",
    title: "Cesto trançado em fibra de arumã",
    price: 79.00,
    unit: "peça",
    category: "artesanato",
    image: "https://images.unsplash.com/photo-1523419409543-a5e549c1d8ff?q=80&w=1200&auto=format&fit=crop",
    vendorId: "v2",
    tags: ["fibra", "feito à mão"],
    origin: "Manaus/AM",
    stock: 15
  },
  {
    id: "p3",
    title: "Óleo de Andiroba (100ml)",
    price: 39.90,
    unit: "frasco",
    category: "cosmeticos",
    image: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c86?q=80&w=1200&auto=format&fit=crop",
    vendorId: "v3",
    tags: ["andiroba", "extrativismo"],
    origin: "Manacapuru/AM",
    stock: 60
  }
];

export function findVendor(id: string) {
  return vendors.find(v => v.id === id);
}
export function findProduct(id: string) {
  return products.find(p => p.id === id);
}
