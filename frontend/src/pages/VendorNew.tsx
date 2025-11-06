// src/pages/VendorNew.tsx
import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
/** @jsxImportSource react */       // pragma


export default function VendorNew() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Manaus/AM");
  const [type, setType] = useState<"agricultor" | "artesao" | "extrativista" | "cooperativa">("agricultor");
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Recebemos seu cadastro! Nossa equipe entrará em contato.");
    setTimeout(() => nav("/catalogo"), 1200);
  }

  const onName = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const onLoc  = (e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value);
  const onType = (e: ChangeEvent<HTMLSelectElement>) =>
    setType(e.target.value as typeof type);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Cadastro de fornecedor(a)</h1>

        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Nome da loja / coletivo"
          value={name}
          onChange={onName}
          required
        />

        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Cidade/UF"
          value={location}
          onChange={onLoc}
          required
        />

        <select className="border rounded-lg px-3 py-2 w-full" value={type} onChange={onType}>
          <option value="agricultor">Agricultor</option>
          <option value="artesao">Artesão</option>
          <option value="extrativista">Extrativista</option>
          <option value="cooperativa">Cooperativa</option>
        </select>

        <button className="w-full rounded-lg bg-emerald-600 text-white py-2">Enviar</button>

        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </form>
    </div>
  );
}
