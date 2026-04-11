const BASE_URL = "http://localhost:8080";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("campusgrid_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Se o token expirar ou não houver permissão
    // localStorage.removeItem("campusgrid_token");
    // window.location.href = "/";
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na requisição");
  }

  if (response.status === 204) return null;
  return response.json();
}
