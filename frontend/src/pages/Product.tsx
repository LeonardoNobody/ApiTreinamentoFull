import { useParams, Link } from "react-router-dom";
import { findProduct, findVendor } from "../data/mock";

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const p = id ? findProduct(id) : undefined;
  if (!p) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <p className="text-slate-600 mb-3">Produto não encontrado.</p>
          <Link to="/catalogo" className="text-blue-600">Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  const v = findVendor(p.vendorId)!;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-slate-500">{p.category.toUpperCase()}</div>
          <h1 className="text-2xl font-semibold">{p.title}</h1>
          <div className="mt-2">
            <span className="text-2xl font-bold">R$ {p.price.toFixed(2)}</span>
            <span className="text-slate-600"> / {p.unit}</span>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            Origem: <strong>{p.origin ?? v.location}</strong>
          </div>

          <Link to={`/fornecedor/${v.id}`} className="inline-block mt-4 text-blue-600">
            Ver fornecedor: {v.name}
          </Link>

          <div className="mt-6">
            <button className="rounded-xl bg-emerald-600 text-white px-4 py-2">
              Adicionar ao carrinho (mock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
