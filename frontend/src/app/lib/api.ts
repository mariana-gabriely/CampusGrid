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
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na requisição");
  }

  if (response.status === 204) return null;
  return response.json();
}

export const environmentApi = {
  listarTodos: (apenasAtivos: boolean = true) => apiFetch(`/environments?apenasAtivos=${apenasAtivos}`),
  cadastrarAmbiente: (data: any) => apiFetch("/environments", { method: "POST", body: JSON.stringify(data) }),
  atualizarAmbiente: (id: string, data: any) => apiFetch(`/environments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  desativarAmbiente: (id: string) => apiFetch(`/environments/${id}`, { method: "DELETE" }),
  ativarAmbiente: (id: string) => apiFetch(`/environments/${id}/ativar`, { method: "PATCH" }),
  apagarFichaTecnica: (id: string) => apiFetch(`/environments/${id}/ficha`, { method: "DELETE" }),
};

export const userApi = {
  listarTodos: (apenasAtivos: boolean = true) => apiFetch(`/users?apenasAtivos=${apenasAtivos}`),
  registrarFuncionario: (data: any) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
  atualizarDados: (id: string, data: any) => apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  revogarAcesso: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
};
