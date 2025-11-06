import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import axios from "axios";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("Enviando...");
    try {
      const { data } = await api.post("/api/Auth/forgot-password", { email });
      setMsg(typeof data === "string" ? data : "Se existir, enviaremos o link.");
    } catch (e: unknown) {
      setMsg(axios.isAxiosError(e) ? (e.response?.data as string) ?? e.message : "Falha ao enviar.");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Esqueci minha senha</h1>
        <input className="w-full border rounded-lg px-3 py-2" placeholder="E-mail"
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="w-full rounded-lg bg-blue-600 text-white py-2">Enviar link</button>
        <Link to="/login" className="text-sm text-blue-600">Voltar ao login</Link>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </form>
    </div>
  );
}
