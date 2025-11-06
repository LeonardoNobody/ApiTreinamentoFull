// src/lib/auth.ts
export type Tokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt?: string;
  refreshExpiresAt?: string;
};

const RT_KEY = "optiktrack:refresh";
let inMemoryAccess: string | null = null;

type TokenResponse = {
  accessToken?: string;
  token?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
};

export function setTokens(data: unknown) {
  const d = data as TokenResponse;
  const at = d.accessToken ?? d.token ?? d.access_token ?? null;
  const rt = d.refreshToken ?? d.refresh_token ?? null;

  if (!at || !rt) throw new Error("Resposta sem tokens esperados.");
  inMemoryAccess = at;
  localStorage.setItem(RT_KEY, rt);
}

export function getAccessToken() { return inMemoryAccess; }
export function getRefreshToken() { return localStorage.getItem(RT_KEY); }
export function clearTokens() { inMemoryAccess = null; localStorage.removeItem(RT_KEY); }
export function isAuthenticated() { return !!getRefreshToken(); }
