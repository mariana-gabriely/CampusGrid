import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { format } from "date-fns";
import { Check, X, User, Calendar, MapPin, AlertCircle, Inbox, Loader2, Download, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";
import { reservaApi, permutaApi } from "../lib/api";

interface ItemFila {
  id: string; // idReserva ou idPermuta
  isPermuta: boolean;
  nomeAmbiente: string;
  nomeSolicitante: string;
  createdAt: string;
  status: string;

  // Info reserva simples
  categoriaAmbiente?: string;
  dataInicio?: string;
  dataFim?: string;
  observacoes?: string;
  anexoNome?: string;

  // Info permuta
  ambienteSolicitanteNome?: string;
  nomeSolicitanteOrig?: string;
  dataInicioSolicitante?: string;
  dataFimSolicitante?: string;

  ambienteDestinatarioNome?: string;
  nomeDestinatarioOrig?: string;
  dataInicioDestinatario?: string;
  dataFimDestinatario?: string;
}

export function ApprovalPanelPage() {
  const [pendentes, setPendentes] = useState<ItemFila[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadPendentes(); }, []);

  async function loadPendentes() {
    try {
      const [resList, permList] = await Promise.all([
        reservaApi.listarPendentes(),
        permutaApi.listarPendentesGestor()
      ]);

      const mappedRes: ItemFila[] = resList.map((r: any) => ({
        id: r.idReserva,
        isPermuta: false,
        nomeAmbiente: r.nomeAmbiente,
        nomeSolicitante: r.nomeSolicitante,
        createdAt: r.createdAt,
        status: r.status,
        categoriaAmbiente: r.categoriaAmbiente,
        dataInicio: r.dataInicio,
        dataFim: r.dataFim,
        observacoes: r.observacoes,
        anexoNome: r.anexoNome
      }));

      const mappedPerm: ItemFila[] = permList.map((p: any) => ({
        id: p.idPermuta,
        isPermuta: true,
        nomeAmbiente: `${p.ambienteSolicitanteNome} ⇄ ${p.ambienteDestinatarioNome}`,
        nomeSolicitante: `${p.nomeSolicitante} e ${p.nomeDestinatario}`,
        createdAt: p.createdAt,
        status: "PERMUTA",
        
        ambienteSolicitanteNome: p.ambienteSolicitanteNome,
        nomeSolicitanteOrig: p.nomeSolicitante,
        dataInicioSolicitante: p.dataInicioSolicitante,
        dataFimSolicitante: p.dataFimSolicitante,

        ambienteDestinatarioNome: p.ambienteDestinatarioNome,
        nomeDestinatarioOrig: p.nomeDestinatario,
        dataInicioDestinatario: p.dataInicioDestinatario,
        dataFimDestinatario: p.dataFimDestinatario,
        
        observacoes: `Permuta de salas aceita entre docentes. Homologação final necessária.`
      }));

      const combined = [...mappedRes, ...mappedPerm].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPendentes(combined);
      if (combined.length > 0) {
        setSelectedId(combined[0].id);
      } else {
        setSelectedId(null);
      }
    } catch {
      toast.error("Erro ao carregar solicitações pendentes");
    } finally {
      setLoading(false);
    }
  }

  const selectedRequest = pendentes.find(r => r.id === selectedId);

  async function handleApprove(id: string, isPermuta: boolean) {
    setSubmitting(true);
    try {
      if (isPermuta) {
        await permutaApi.avaliarGestor(id, { aprovar: true });
        toast.success("Permuta homologada com sucesso.");
      } else {
        await reservaApi.aprovar(id);
        toast.success("Reserva efetivada com sucesso.");
      }
      setPendentes(prev => prev.filter(r => r.id !== id));
      setSelectedId(prev => {
        const remaining = pendentes.filter(r => r.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      });
    } catch (e: any) {
      toast.error(e.message || "Erro ao aprovar solicitação");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) { toast.error("Informe o motivo da recusa."); return; }
    if (!selectedId) return;
    const item = pendentes.find(r => r.id === selectedId);
    if (!item) return;

    setSubmitting(true);
    try {
      if (item.isPermuta) {
        await permutaApi.avaliarGestor(selectedId, { aprovar: false, motivoRecusa: rejectionReason });
        toast.success("Proposta de permuta recusada.");
      } else {
        await reservaApi.recusar(selectedId, rejectionReason);
        toast.success("Solicitação de reserva recusada.");
      }
      setPendentes(prev => prev.filter(r => r.id !== selectedId));
      setSelectedId(prev => {
        const remaining = pendentes.filter(r => r.id !== selectedId);
        return remaining.length > 0 ? remaining[0].id : null;
      });
      setRejectionReason("");
      setShowRejectForm(false);
    } catch (e: any) {
      toast.error(e.message || "Erro ao recusar solicitação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel de Aprovação</h1>
          <p className="text-sm text-slate-500">Gestão de solicitações de reservas e permutas pendentes de efetivação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-slate-200 rounded-md bg-white overflow-hidden flex-1 shadow-sm">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Inbox className="w-3.5 h-3.5" /> Fila de Espera ({loading ? "…" : pendentes.length})
              </h2>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
              ) : pendentes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-medium">Nenhuma pendência.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendentes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedId(r.id); setShowRejectForm(false); }}
                      className={cn(
                        "w-full text-left p-4 transition-colors",
                        selectedId === r.id
                          ? "bg-white border-l-4 border-l-primary shadow-sm"
                          : "hover:bg-slate-100 border-l-4 border-l-transparent"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{r.nomeAmbiente}</span>
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded",
                          r.isPermuta 
                            ? "bg-purple-50 text-purple-700 border border-purple-100" 
                            : r.status === "PENDENTE_CANCELAMENTO"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-orange-50 text-orange-600 border border-orange-100"
                        )}>
                          {r.isPermuta ? "PERMUTA" : r.status === "PENDENTE_CANCELAMENTO" ? "CANCELAMENTO" : "RESERVA"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{r.nomeSolicitante}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {format(new Date(r.createdAt), "dd/MM HH:mm")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Detail Area */}
          <div className="md:col-span-8 lg:col-span-9 bg-white flex flex-col">
            {selectedRequest ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 bg-slate-50/20">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded tracking-wide uppercase",
                        selectedRequest.isPermuta 
                          ? "bg-purple-100 text-purple-800" 
                          : selectedRequest.status === "PENDENTE_CANCELAMENTO"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      )}>
                        {selectedRequest.isPermuta 
                          ? "Solicitação de Permuta" 
                          : selectedRequest.status === "PENDENTE_CANCELAMENTO"
                            ? "Solicitação de Cancelamento"
                            : "Solicitação de Reserva"}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedRequest.nomeAmbiente}</h2>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <User className="w-4 h-4" /> {selectedRequest.nomeSolicitante}
                      </p>
                    </div>
                    {!selectedRequest.isPermuta && selectedRequest.dataInicio && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Período Selecionado</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">{format(new Date(selectedRequest.dataInicio), "dd/MM/yyyy")}</p>
                        <p className="text-xs text-slate-500">{format(new Date(selectedRequest.dataInicio), "HH:mm")} - {format(new Date(selectedRequest.dataFim!), "HH:mm")}</p>
                      </div>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 p-8">
                  <div className="max-w-2xl space-y-6">
                    {selectedRequest.isPermuta ? (
                      <div className="space-y-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                          {/* Solicitante Card */}
                          <div className="flex-1 w-full p-4 bg-white border border-slate-150 rounded-md shadow-sm space-y-2">
                            <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Proponente</span>
                            <h4 className="font-bold text-slate-800 text-sm">{selectedRequest.nomeSolicitanteOrig}</h4>
                            <div className="h-px bg-slate-100 my-2" />
                            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedRequest.ambienteSolicitanteNome}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {format(new Date(selectedRequest.dataInicioSolicitante!), "dd/MM/yyyy HH:mm")} - {format(new Date(selectedRequest.dataFimSolicitante!), "HH:mm")}</p>
                          </div>

                          {/* Swap Icon */}
                          <div className="flex items-center justify-center bg-purple-100 text-purple-600 w-9 h-9 rounded-full shrink-0 border-2 border-white shadow">
                            <ArrowLeftRight className="w-4 h-4" />
                          </div>

                          {/* Destinatario Card */}
                          <div className="flex-1 w-full p-4 bg-white border border-slate-150 rounded-md shadow-sm space-y-2">
                            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Destinatário</span>
                            <h4 className="font-bold text-slate-800 text-sm">{selectedRequest.nomeDestinatarioOrig}</h4>
                            <div className="h-px bg-slate-100 my-2" />
                            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedRequest.ambienteDestinatarioNome}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {format(new Date(selectedRequest.dataInicioDestinatario!), "dd/MM/yyyy HH:mm")} - {format(new Date(selectedRequest.dataFimDestinatario!), "HH:mm")}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50/50 border-l-4 border-purple-500 flex gap-3 text-purple-900 rounded-r-md">
                          <AlertCircle className="w-5 h-5 text-purple-600 shrink-0" />
                          <p className="text-xs leading-relaxed">
                            <strong>Homologação de Permuta:</strong> Ao aprovar, o sistema realizará a troca de solicitantes entre as duas reservas aprovadas. Os novos donos visualizarão suas reservas permutadas imediatamente nas suas respectivas abas.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedRequest.observacoes && (
                          <section>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Observações do Solicitante</h3>
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded border border-slate-100">{selectedRequest.observacoes}</p>
                          </section>
                        )}
                        {selectedRequest.anexoNome && (
                          <section>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Documentação Anexa</h3>
                            <a
                              href={reservaApi.downloadAnexoUrl(selectedRequest.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-700 hover:bg-emerald-100 font-medium transition-colors w-fit"
                            >
                              <Download className="w-4 h-4" /> Baixar {selectedRequest.anexoNome}
                            </a>
                          </section>
                        )}
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-400 flex gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            <strong>Atenção:</strong> Ao aprovar, o sistema verificará automaticamente se não há conflito com outras reservas já aprovadas neste período.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  {showRejectForm ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">
                          {selectedRequest.status === "PENDENTE_CANCELAMENTO" 
                            ? "Motivo da Recusa do Cancelamento" 
                            : "Motivo da Recusa"}
                        </Label>
                        <Textarea
                          placeholder={selectedRequest.status === "PENDENTE_CANCELAMENTO"
                            ? "Descreva a justificativa para manter a reserva ativa..."
                            : "Descreva o motivo para o solicitante..."}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="rounded-md border-slate-200 resize-none h-24 text-sm shadow-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowRejectForm(false)}>Cancelar</Button>
                        <Button variant="destructive" className="flex-1 rounded-md font-bold text-xs uppercase" onClick={handleReject} disabled={submitting}>
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {selectedRequest.status === "PENDENTE_CANCELAMENTO"
                            ? "Rejeitar Cancelamento (Manter Reserva)"
                            : "Confirmar Recusa"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 h-12 rounded-md font-bold uppercase text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApprove(selectedRequest.id, selectedRequest.isPermuta)}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                        {selectedRequest.isPermuta 
                          ? "Homologar Permuta" 
                          : selectedRequest.status === "PENDENTE_CANCELAMENTO"
                            ? "Homologar Cancelamento"
                            : "Efetivar Reserva"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-md font-bold uppercase text-xs tracking-widest border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 shadow-none"
                        onClick={() => setShowRejectForm(true)}
                        disabled={submitting}
                      >
                        <X className="w-4 h-4 mr-2" /> 
                        {selectedRequest.isPermuta 
                          ? "Recusar Permuta" 
                          : selectedRequest.status === "PENDENTE_CANCELAMENTO"
                            ? "Recusar Cancelamento"
                            : "Recusar Pedido"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <Inbox className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-medium">
                  {loading ? "Carregando..." : "Nenhuma solicitação pendente"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}