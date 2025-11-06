// src/pages/Catalog.tsx
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { vendors as seed, type Vendor, type MarketplaceKey } from "./data";

/** SVGs/cores por marketplace (mínimos, sem libs) */
const logos: Record<MarketplaceKey, JSX.Element> = {
  mercadolivre: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="#ffea00" />
      <path d="M6.5 12c1.2-1.2 3.6-2.6 5.5-2.6S4.3 1 5.5 2.6" stroke="#333" fill="none"/>
    </svg>
  ),
  shopee: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <rect x="4" y="7" width="16" height="12" rx="2" fill="#ee4d2d" />
      <path d="M9 12h3m 0 1 0 3" stroke="#fff" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  shein: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path d="M8 5h8v3H12v8h4v3H8v-3h4V8H8V5Z" fill="#111" />
    </svg>
  ),
};

const colorByMk: Record<MarketplaceKey, string> = {
  mercadolivre: "bg-yellow-200 text-yellow-900",
  shopee: "bg-orange-200 text-orange-900",
  shein: "bg-slate-200 text-slate-900",
};

export default function Catalog() {
  const [q, setQ] = useState<string>("");
  const [mk, setMk] = useState<MarketplaceKey | "todos">("todos");

  // usa os dados “seed” importados
  const data = useMemo(() => {
    const byText = (v: Vendor) =>
      [v.name, v.city, v.uf, v.category].join(" ").toLowerCase().includes(q.toLowerCase());

    const byMk = (v: Vendor) => (mk === "todos" ? true : v.marketplace === mk);

    return seed.filter((v) => byText(v) && byMk(v));
  }, [q, mk]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Catálogo de Fornecedores</h1>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, cidade, categoria…"
              className="w-72 rounded-lg border px-3 py-2"
            />
            <select
              value={mk}
              onChange={(e) => setMk(e.target.value as MarketplaceKey | "todos")}
              className="rounded-lg border px-3 py-2"
            >
              <option value="todos">Todos os marketplaces</option>
              <option value="mercadolivre">Mercado Livre</option>
              <option value="shopee">Shopee</option>
              <option value="shein">Shein</option>
            </select>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((v: Vendor) => (
            <article
              key={v.id}
              className="rounded-2xl bg-white shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="aspect-4/3 w-full bg-slate-100">
                {/* imagem placeholder */}
                <img
                  src={v.image}
                  alt={v.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ${colorByMk[v.marketplace]}`}>
                    {logos[v.marketplace]}
                    {v.marketplace}
                  </span>
                  <span className="ml-auto text-xs text-slate-500">
                    ⭐ {v.rating.toFixed(1)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">{v.name}</h3>
                <p className="text-sm text-slate-600">
                  {v.city}/{v.uf} • {v.category}
                </p>

                <button className="mt-2 w-full rounded-lg bg-slate-900 text-white py-2">
                  Ver perfil
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
