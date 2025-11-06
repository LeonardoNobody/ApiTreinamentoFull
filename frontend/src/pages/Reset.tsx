// src/pages/Reset.tsx
import { useEffect, useState, type FormEvent } from "react";
import api from "../lib/api";
import { isAxiosError } from "axios";

type ResetEmailResp = { email: string };

export default function Reset() {
  // 1) parametros da URL
  const qs = new URLSearchParams(location.search);
  const userId = qs.get("userId") ?? "";
  const token  = qs.get("token") ?? "";

  // estados
  const [emailMask, setEmailMask] = useState<string>("");
  const [pwd,  setPwd ] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg,  setMsg ] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const missing = !userId || !token;

  // 2) buscar e-mail mascarado (opcional, mas elegante)
  useEffect(() => {
    if (missing) return;
    (async () => {
      try {
        const { data } = await api.get<ResetEmailResp>("/api/Auth/reset-email", {
          params: { userId, token }
        });
        setEmailMask(data.email ?? "");
      } catch {
        setEmailMask(""); // silencia, não é obrigatório
      }
    })();
  }, [missing, userId, token]);

  // 3) submit do reset
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pwd.length < 8) { setMsg("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (pwd !== pwd2)  { setMsg("As senhas não conferem."); return; }

    setMsg("Enviando…");
    setBusy(true);
    try {
      const { data } = await api.post("/api/Auth/reset-password", {
        userId, token, newPassword: pwd
      });
      setMsg(typeof data === "string" ? data : "Senha redefinida com sucesso!");
    } catch (err: unknown) {
      const friendly =
        isAxiosError(err)
          ? (typeof err.response?.data === "string" ? err.response.data : err.message || "Falha ao redefinir.")
          : "Falha ao redefinir.";
      setMsg(friendly);
    } finally {
      setBusy(false);
    }
  }

  // 4) UI
  if (missing) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-3">
          <h1 className="text-xl font-semibold">Link inválido</h1>
          <p className="text-sm text-slate-600">
            Este endereço precisa conter <code>userId</code> e <code>token</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Redefinir senha</h1>

        {emailMask && (
          <p className="text-sm text-slate-600">Conta: <span className="font-medium">{emailMask}</span></p>
        )}

        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Nova senha (mín. 8)"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Confirmar nova senha"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
        />

        <button
          className="w-full rounded-lg bg-blue-600 text-white py-2 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Enviando…" : "Redefinir"}
        </button>

        {msg && <p className="text-sm text-slate-700">{msg}</p>}
      </form>
    </div>
  );
}
