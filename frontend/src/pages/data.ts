// src/pages/data.ts
export type MarketplaceKey = "mercadolivre" | "shopee" | "shein";

export type Vendor = {
  id: string;
  name: string;
  category: "agricultor" | "artesao" | "extrativista" | "cooperativa";
  city: string;
  uf: string;
  rating: number;          // 0..5
  marketplace: MarketplaceKey;
  image?: string;          // url opcional
};

export const vendors: Vendor[] = [
  {
    id: "v-001",
    name: "Cooperativa Verde Rio Negro",
    category: "cooperativa",
    city: "Manaus",
    uf: "AM",
    rating: 4.8,
    marketplace: "mercadolivre",
    image: "https://picsum.photos/seed/coop1/800/600"
  },
  {
    id: "v-002",
    name: "Artesanato Tupã",
    category: "artesao",
    city: "Manaus",
    uf: "AM",
    rating: 4.6,
    marketplace: "shopee",
    image: "https://picsum.photos/seed/art1/800/600"
  },
  {
    id: "v-003",
    name: "Castanha do Rio Madeira",
    category: "extrativista",
    city: "Manicoré",
    uf: "AM",
    rating: 4.7,
    marketplace: "shein",
    image: "https://picsum.photos/seed/castanha/800/600"
  }
];
