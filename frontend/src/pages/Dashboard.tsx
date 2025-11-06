import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { clearTokens, getRefreshToken } from "../lib/auth";
import axios from "axios";
// adicione esta linha junto dos outros imports
import type { ReactElement } from "react";


/** ─────────────────────────────────────────────────────────────────────
 * Tipos
 * ────────────────────────────────────────────────────────────────────*/
type Me = { sub?: string; email?: string; jti?: string };
type MarketplaceKey = "mercadolivre" | "shopee" | "shein";

type MkSummary = {
  key: MarketplaceKey;
  name: string;
  ordersToday: number;
  revenueToday: number; // em reais
  connected: boolean;
};

type Overall = {
  ordersToday: number;
  revenueToday: number;
  ticketAvgToday: number;
};

/** ─────────────────────────────────────────────────────────────────────
 * SVGs/estilo (mínimos, sem libs)
 * ────────────────────────────────────────────────────────────────────*/
const logos: Record<MarketplaceKey, ReactElement> = {

  mercadolivre: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" fill="#ffea00" />
      <path d="M6.5 12c1.2-1.6 3-2.6 5.5-2.6s4.3 1 5.5 2.6" stroke="#333" strokeWidth="1.6" fill="none"/>
    </svg>
  ),
  shopee: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <rect x="4" y="7" width="16" height="12" rx="2" fill="#ee4d2d"/>
      <path d="M9 7a3 3 0 1 1 6 0" stroke="#fff" strokeWidth="1.5" fill="none"/>
      <path d="M9 12h6M9 15h6" stroke="#fff" strokeWidth="1.5" />
    </svg>
  ),
  shein: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <rect x="4" y="4" width="16" height="16" rx="4" fill="#111"/>
      <path d="M9 8h6M9 12h6M9 16h6" stroke="#fff" strokeWidth="1.6" />
    </svg>
  ),
};

const mkColors: Record<MarketplaceKey, string> = {
  mercadolivre: "bg-yellow-100 text-yellow-900",
  shopee: "bg-orange-100 text-orange-900",
  shein: "bg-slate-200 text-slate-900",
};

/** ─────────────────────────────────────────────────────────────────────
 * Comps pequenos de UI
 * ────────────────────────────────────────────────────────────────────*/
function StatCard(props: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{props.title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{props.value}</div>
      {props.subtitle && <div className="mt-1 text-xs text-slate-500">{props.subtitle}</div>}
    </div>
  );
}

function MarketplaceCard({ m }: { m: MkSummary }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center justify-center rounded-lg p-2 ${mkColors[m.key]}`}>
          {logos[m.key]}
        </div>
        <div className="font-medium">{m.name}</div>
        <div className={`ml-auto text-xs px-2 py-0.5 rounded-full ${m.connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
          {m.connected ? "Conectado" : "Desconectado"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Pedidos (hoje)</div>
          <div className="text-lg font-semibold">{m.ordersToday}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-xs text-slate-500">Faturamento (hoje)</div>
          <div className="text-lg font-semibold">
            {m.revenueToday.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>
      </div>

      <div className="mt-1 flex gap-2">
        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          Ver pedidos
        </button>
        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          Campanhas
        </button>
        <button className="ml-auto rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm hover:opacity-90">
          Configurar
        </button>
      </div>
    </div>
  );
}

/** ─────────────────────────────────────────────────────────────────────
 * Página
 * ────────────────────────────────────────────────────────────────────*/
export default function Dashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [overall, setOverall] = useState<Overall | null>(null);
  const [mks, setMks] = useState<MkSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // carrega “quem sou eu” (token válido) + mock dos cards (troque por API real quando tiver)
  useEffect(() => {
    (async () => {
      try {
        const meResp = await api.get("/api/Auth/me");
        setMe(meResp.data as Me);

        // ⬇️ MOCK: troque por endpoints reais quando prontos:
        //   GET /api/marketplaces/overall
        //   GET /api/marketplaces/summary
        const mockOverall: Overall = {
          ordersToday: 23,
          revenueToday: 5290.4,
          ticketAvgToday: 5290.4 / 23,
        };
        const mockMks: MkSummary[] = [
          { key: "mercadolivre", name: "Mercado Livre", ordersToday: 12, revenueToday: 2900.1, connected: true },
          { key: "shopee",       name: "Shopee",        ordersToday: 7,  revenueToday: 1490.2, connected: true },
          { key: "shein",        name: "Shein",         ordersToday: 4,  revenueToday: 900.1,  connected: false },
        ];

        // // Quando sua API existir, fica assim:
        // const ovr = await api.get<Overall>("/api/marketplaces/overall");
        // const sum = await api.get<MkSummary[]>("/api/marketplaces/summary");
        // setOverall(ovr.data);
        // setMks(sum.data);

        setOverall(mockOverall);
        setMks(mockMks);
      } catch {
        // se /me falhar, o Guard deve redirecionar — aqui só silenciamos
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function logout() {
    try {
      const rt = getRefreshToken();
      if (rt) await api.post("/api/Auth/logout", { refreshToken: rt });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) console.warn(e.message);
    } finally {
      clearTokens();
      nav("/login", { replace: true });
    }
  }

  const username = useMemo(() => me?.email ?? "Usuário", [me]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* topo */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">OptikTrack — Dashboard</div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">{username}</span>
            <button onClick={logout} className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm hover:opacity-90">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* conteúdo */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Pedidos (hoje)"
            value={loading ? "—" : String(overall?.ordersToday ?? 0)}
          />
          <StatCard
            title="Faturamento (hoje)"
            value={loading ? "—" : (overall?.revenueToday ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          />
          <StatCard
            title="Ticket médio"
            value={loading ? "—" : (overall?.ticketAvgToday ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          />
        </section>

        {/* Marketplaces */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Marketplaces</h2>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              Adicionar integração
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mks.map((m) => <MarketplaceCard key={m.key} m={m} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
