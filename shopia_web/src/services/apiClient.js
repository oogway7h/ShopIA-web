import { getToken, clearAuth } from "./auth.js";

// Configuración simple y directa
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // En desarrollo local: usar proxy (/api)
  // En producción: usar URL completa
  //const isDev = import.meta.env.DEV;
  //const isLocal = window.location.hostname === 'localhost';

  let fullUrl;
  if (url.startsWith("http")) {
    fullUrl = url;
  } else {
    fullUrl = `${API_BASE}${url}`;
  }

  const res = await fetch(fullUrl, { ...options, headers });

  let data = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("❌ Error parsing JSON:", e);
  }

  if (res.status === 401) {
    clearAuth();
    if (!url.includes("/login")) window.location.href = "/login";
  }

  if (!res.ok) {
    throw new Error(data?.detail || data?.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  get: (u) => apiFetch(u),
  post: (u, b) => apiFetch(u, { method: "POST", body: JSON.stringify(b) }),
  put: (u, b) => apiFetch(u, { method: "PUT", body: JSON.stringify(b) }),
  patch: (u, b) => apiFetch(u, { method: "PATCH", body: JSON.stringify(b) }),
  del: (u) => apiFetch(u, { method: "DELETE" }),
};
