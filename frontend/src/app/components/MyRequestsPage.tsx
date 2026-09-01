import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, X, Calendar, ChevronRight, Trash2, Loader2, Inbox, Download, ArrowLeftRight, Pencil } from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "sonner";
import { reservaApi } from "../lib/api";
import { useNavigate } from "react-router-dom";

type ReservaStatus = "PENDENTE" | "APROVADO" | "RECUSADO" | "CANCELADO" | "PENDENTE_CANCELAMENTO";

interface Reserva {
  idReserva: string;
  nomeAmbiente: string;
  categoriaAmbiente: string;
  dataInicio: string;
  dataFim: string;
  status: ReservaStatus;
  observacoes?: string;
  nomeAprovador?: string;
  motivoRecusa?: string;
  anexoNome?: string;
  createdAt: string;
}

export function MyRequestsPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReservas(); }, []);

  async function loadReservas() {
    try {
      const data = await reservaApi.listarMinhas();
      setReservas(data);
    } catch {
      toast.error("Erro ao carregar reservas");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelar(id: string) {
    if (!window.confirm("Deseja realmente solicitar o cancelamento desta reserva?")) return;
    try {
      await reservaApi.cancelar(id);
      setReservas(prev => prev.map(r => {
        if (r.idReserva === id) {
          return {
            ...r,
            status: r.status === "PENDENTE" ? "CANCELADO" : "PENDENTE_CANCELAMENTO"
          };
        }
        return r;
      }));
      toast.success("Solicitação processada", { description: "O status da reserva foi atualizado." });
    } catch (e: any) {
      toast.error(e.message || "Erro ao cancelar reserva");
    }
  }

  const getStatusStyle = (status: ReservaStatus) => {
    switch (status) {
      case "APROVADO": return { icon: Check, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "APROVADA" };
      case "RECUSADO": return { icon: X, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "RECUSADA" };
      case "CANCELADO": return { icon: X, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: "CANCELADA" };
      case "PENDENTE_CANCELAMENTO": return { icon: Clock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", label: "CANCELAMENTO PENDENTE" };
      default: return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "EM ANÁLISE" };
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Minhas Reservas</h1>
            <p className="text-sm text-slate-500">Histórico de solicitações realizadas no CampusGrid.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => navigate("/permutas")}
              variant="outline"
              className="rounded-md h-9 px-4 font-bold text-xs uppercase border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-2" /> Realizar Permuta
            </Button>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Aprovadas</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pendentes</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : reservas.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-md flex flex-col items-center gap-3">
            <Inbox className="w-10 h-10 text-slate-200" />
            <p className="text-slate-400 font-medium italic">Nenhuma reserva encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((reserva) => {
              const style = getStatusStyle(reserva.status);
              const Icon = style.icon;
              return (
                <div key={reserva.idReserva} className="bg-white border border-slate-200 rounded-md p-4 hover:border-slate-300 transition-colors flex items-center gap-6 shadow-sm">
                  <div className={cn("w-12 h-12 rounded flex items-center justify-center shrink-0 border", style.bg, style.border, style.color)}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{reserva.nomeAmbiente}</h3>
                      <Badge className={cn("text-[9px] font-black tracking-widest px-1.5 h-4", style.bg, style.color, "border-none")}>
                        {style.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(reserva.dataInicio), "dd/MM/yyyy")}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(reserva.dataInicio), "HH:mm")} - {format(new Date(reserva.dataFim), "HH:mm")}</span>
                    </div>
                    {reserva.status === "RECUSADO" && reserva.motivoRecusa && (
                      <p className="text-xs text-red-500 mt-1 font-medium">Motivo: {reserva.motivoRecusa}</p>
                    )}
                    {reserva.anexoNome && (
                      <div className="mt-2">
                        <a
                          href={reservaApi.downloadAnexoUrl(reserva.idReserva)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded px-2.5 py-1 transition-colors"
                        >
                          <Download className="w-3 h-3" /> Anexo: {reserva.anexoNome}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</p>
                    <p className="text-xs font-bold text-slate-600">{reserva.categoriaAmbiente}</p>
                  </div>

                  <div className="flex items-center gap-1 border-l border-slate-100 pl-6 ml-2">
                    {reserva.status === "PENDENTE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/new-request?edit=${reserva.idReserva}`)}
                        className="text-slate-600 hover:text-primary hover:bg-slate-50 font-bold text-[10px] uppercase h-8 px-3"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                      </Button>
                    )}
                    {(reserva.status === "PENDENTE" || reserva.status === "APROVADO") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelar(reserva.idReserva)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-[10px] uppercase h-8 px-3"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Cancelar
                      </Button>
                    )}
                    <button title="Ver Detalhes" className="p-2 text-slate-400 hover:text-slate-600 rounded transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}