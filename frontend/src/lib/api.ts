// src/lib/api.ts
import axios, { type AxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((cfg) => {
  const at = getAccessToken();
  if (at) cfg.headers.Authorization = `Bearer ${at}`;
  return cfg;
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as RetryConfig;

    if (err?.response?.status === 401 && !original?._retry) {
      const rt = getRefreshToken();
      if (!rt) { clearTokens(); return Promise.reject(err); }

      if (!refreshing) {
        refreshing = api
          .post("/api/Auth/refresh", { refreshToken: rt })
          .then((r) => setTokens(r.data))
          .finally(() => { refreshing = null; });
      }

      await refreshing;
      original._retry = true;
      return api.request(original);
    }

    return Promise.reject(err);
  }
);

export default api;
