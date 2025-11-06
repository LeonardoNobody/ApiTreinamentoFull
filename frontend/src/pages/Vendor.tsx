import { useParams } from "react-router-dom";
import { findVendor, products } from "../data/mock";
import { Link } from "react-router-dom";

export default function Vendor() {
  const { id } = useParams<{ id: string }>();
  const v = id ? findVendor(id) : undefined;
  if (!v) return <div className="min-h-screen grid place-items-center text-slate-500">Fornecedor não encontrado.</div>;

  const items = products.filter(p => p.vendorId === v.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold">{v.name}</h1>
          <div className="text-slate-600">{v.type} • {v.location} • ⭐ {v.rating.toFixed(1)}</div>
          {v.bio && <p className="mt-3 text-slate-700">{v.bio}</p>}
        </div>

        <h2 className="mt-6 mb-2 text-lg font-semibold">Produtos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(p => (
            <Link key={p.id} to={`/produto/${p.id}`} className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="aspect-4/3 bg-slate-100">
                {p.image && <img src={p.image} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="text-sm text-slate-500">{p.category.toUpperCase()}</div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-slate-700">
                  <span className="font-bold">R$ {p.price.toFixed(2)}</span> / {p.unit}
                </div>
              </div>
            </Link>
          ))}
          {items.length === 0 && <div className="text-slate-500">Nenhum produto ainda.</div>}
        </div>
      </div>
    </div>
  );
}
