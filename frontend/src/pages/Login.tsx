import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { setTokens } from "../lib/auth";
import axios from "axios";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("Entrando...");
    try {
      const { data } = await api.post("/api/Auth/login", { email, password: pwd });
      setTokens(data);
      setMsg(null);
      nav("/", { replace: true });
    } catch (e: unknown) {
      setMsg(axios.isAxiosError(e) ? (e.response?.data as string) ?? e.message : "Falha no login");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <input className="w-full border rounded-lg px-3 py-2" placeholder="E-mail"
               value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2" type="password" placeholder="Senha"
               value={pwd} onChange={(e) => setPwd(e.target.value)} />
        <button className="w-full rounded-lg bg-blue-600 text-white py-2">Login</button>
        <div className="text-sm flex justify-between">
          <Link to="/register" className="text-blue-600">Criar conta</Link>
          <Link to="/forgot" className="text-blue-600">Esqueci minha senha</Link>
        </div>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </form>
    </div>
  );
}
