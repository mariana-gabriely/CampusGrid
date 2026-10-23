const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function apiDownload(endpoint: string, filename: string) {
  const token = localStorage.getItem("campusgrid_token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("campusgrid_token");
    localStorage.removeItem("campusgrid_user");
    window.location.href = "/";
    throw new Error("Sessão expirada");
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ${response.status}`);
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("campusgrid_token");

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("campusgrid_token");
    localStorage.removeItem("campusgrid_user");
    window.location.href = "/";
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const environmentApi = {
  listarTodos: (apenasAtivos: boolean = true) =>
    apiFetch(`/environments?apenasAtivos=${apenasAtivos}`),
  cadastrarAmbiente: (data: any) =>
    apiFetch("/environments", { method: "POST", body: JSON.stringify(data) }),
  atualizarAmbiente: (id: string, data: any) =>
    apiFetch(`/environments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  desativarAmbiente: (id: string) =>
    apiFetch(`/environments/${id}`, { method: "DELETE" }),
  ativarAmbiente: (id: string) =>
    apiFetch(`/environments/${id}/ativar`, { method: "PATCH" }),
  apagarFichaTecnica: (id: string) =>
    apiFetch(`/environments/${id}/ficha`, { method: "DELETE" }),
};

export const userApi = {
  listarTodos: (apenasAtivos: boolean = true) =>
    apiFetch(`/users?apenasAtivos=${apenasAtivos}`),
  registrarFuncionario: (data: any) =>
    apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
  atualizarDados: (id: string, data: any) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  revogarAcesso: (id: string) =>
    apiFetch(`/users/${id}`, { method: "DELETE" }),
};

export const reservaApi = {
  solicitar: (data: { idAmbiente: string; dataInicio: string; dataFim: string; observacoes?: string; publicoEsperado?: number; recursosRequisitados?: string[]; file?: File }) => {
    if (data.file) {
      const formData = new FormData();
      formData.append("idAmbiente", data.idAmbiente);
      formData.append("dataInicio", data.dataInicio);
      formData.append("dataFim", data.dataFim);
      if (data.observacoes) formData.append("observacoes", data.observacoes);
      if (data.publicoEsperado) formData.append("publicoEsperado", String(data.publicoEsperado));
      if (data.recursosRequisitados && data.recursosRequisitados.length > 0) {
        data.recursosRequisitados.forEach(r => formData.append("recursosRequisitados", r));
      }
      formData.append("file", data.file);
      return apiFetch("/reservas", { method: "POST", body: formData });
    }
    return apiFetch("/reservas", { method: "POST", body: JSON.stringify(data) });
  },
  obterPorId: (id: string) =>
    apiFetch(`/reservas/${id}`),
  atualizar: (id: string, data: { idAmbiente: string; dataInicio: string; dataFim: string; observacoes?: string; publicoEsperado?: number; recursosRequisitados?: string[]; file?: File }) => {
    if (data.file) {
      const formData = new FormData();
      formData.append("idAmbiente", data.idAmbiente);
      formData.append("dataInicio", data.dataInicio);
      formData.append("dataFim", data.dataFim);
      if (data.observacoes) formData.append("observacoes", data.observacoes);
      if (data.publicoEsperado) formData.append("publicoEsperado", String(data.publicoEsperado));
      if (data.recursosRequisitados && data.recursosRequisitados.length > 0) {
        data.recursosRequisitados.forEach(r => formData.append("recursosRequisitados", r));
      }
      formData.append("file", data.file);
      return apiFetch(`/reservas/${id}`, { method: "PUT", body: formData });
    }
    return apiFetch(`/reservas/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  cancelar: (id: string) =>
    apiFetch(`/reservas/${id}`, { method: "DELETE" }),
  listarMinhas: () =>
    apiFetch("/reservas/minhas"),
  listarTodas: () =>
    apiFetch("/reservas"),
  listarPendentes: () =>
    apiFetch("/reservas/pendentes"),
  aprovar: (id: string) =>
    apiFetch(`/reservas/${id}/aprovar`, { method: "PATCH" }),
  recusar: (id: string, motivoRecusa: string) =>
    apiFetch(`/reservas/${id}/recusar`, { method: "PATCH", body: JSON.stringify({ motivoRecusa }) }),
  ocupacaoNoPeriodo: (inicio: string, fim: string) =>
    apiFetch(`/reservas/ocupacao?inicio=${inicio}&fim=${fim}`),
  downloadAnexo: (id: string, filename = "anexo.pdf") =>
    apiDownload(`/reservas/${id}/anexo`, filename),
  downloadOcupacaoPdf: (idAmbiente: string, inicio: string, fim: string, filename: string) =>
    apiDownload(`/reservas/ocupacao/pdf?idAmbiente=${encodeURIComponent(idAmbiente)}&inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`, filename),
};

export const permutaApi = {
  propor: (data: { idReservaSolicitante: string; idReservaDestinatario: string }) =>
    apiFetch("/permutas", { method: "POST", body: JSON.stringify(data) }),
  responder: (id: string, data: { aceitar: boolean; motivoRecusa?: string }) =>
    apiFetch(`/permutas/${id}/responder`, { method: "PATCH", body: JSON.stringify(data) }),
  avaliarGestor: (id: string, data: { aprovar: boolean; motivoRecusa?: string }) =>
    apiFetch(`/permutas/${id}/avaliar-gestor`, { method: "PATCH", body: JSON.stringify(data) }),
  listarRecebidas: () =>
    apiFetch("/permutas/recebidas"),
  listarEnviadas: () =>
    apiFetch("/permutas/enviadas"),
  listarPendentesGestor: () =>
    apiFetch("/permutas/pendentes-gestor"),
  cancelar: (id: string) =>
    apiFetch(`/permutas/${id}`, { method: "DELETE" }),
};

export const auditoriaApi = {
  listarHistorico: () =>
    apiFetch("/audit-log"),
  porUsuario: (idUsuario: string) =>
    apiFetch(`/audit-log/usuario/${idUsuario}`),
  porReserva: (idReserva: string) =>
    apiFetch(`/audit-log/reserva/${idReserva}`),
};

export const campusApi = {
  listar: () => apiFetch("/campuses"),
};

export const bloqueioApi = {
  listar: () => apiFetch("/institutional-blocks"),
  criar: (data: { idAmbiente?: string; dataInicio: string; dataFim: string; motivo: string }) =>
    apiFetch("/institutional-blocks", { method: "POST", body: JSON.stringify(data) }),
  cancelar: (id: string) => apiFetch(`/institutional-blocks/${id}`, { method: "DELETE" }),
};
