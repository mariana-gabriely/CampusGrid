import { Layout } from "./Layout";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { mockRequests } from "../data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, X, Calendar, ChevronRight, FileText, Trash2 } from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function MyRequestsPage() {
  const { user } = useAuth();
  const myRequests = mockRequests.filter(r => r.requesterId === user?.id);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "aprovado": return { icon: Check, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "APROVADA" };
      case "recusado": return { icon: X, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", label: "RECUSADA" };
      default: return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", label: "EM ANÁLISE" };
    }
  };

  const handleCancelRequest = (id: string) => {
    toast.success("Solicitação cancelada com sucesso.", {
        description: "A reserva foi removida da fila de análise do gestor."
    });
    // In real app: dispatch delete request to API
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Minhas Reservas</h1>
            <p className="text-sm text-slate-500">Histórico de solicitações realizadas no CampusGrid.</p>
          </div>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Aprovadas</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pendentes</div>
          </div>
        </div>

        <div className="space-y-3">
            {myRequests.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-md">
                    <p className="text-slate-400 font-medium italic">Nenhuma reserva encontrada.</p>
                </div>
            ) : (
                myRequests.map((request) => {
                    const style = getStatusStyle(request.status);
                    const Icon = style.icon;

                    return (
                        <div key={request.id} className="bg-white border border-slate-200 rounded-md p-4 hover:border-slate-300 transition-colors flex items-center gap-6 shadow-sm relative group">
                            <div className={cn("w-12 h-12 rounded flex items-center justify-center shrink-0 border", style.bg, style.border, style.color)}>
                                <Icon className="w-6 h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-900 truncate">{request.environmentName}</h3>
                                    <Badge className={cn("text-[9px] font-black tracking-widest px-1.5 h-4", style.bg, style.color, "border-none")}>
                                        {style.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(request.startDate), "dd/MM/yyyy")}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(request.startDate), "HH:mm")} - {format(new Date(request.endDate), "HH:mm")}</span>
                                </div>
                            </div>

                            <div className="hidden lg:block text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Protocolo</p>
                                <p className="text-xs font-mono text-slate-600 font-bold">#{request.id.padStart(6, '0')}</p>
                            </div>

                            <div className="flex items-center gap-1 border-l border-slate-100 pl-6 ml-2">
                                {request.status === "pendente" && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleCancelRequest(request.id)}
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
                })
            )}
        </div>
      </div>
    </Layout>
  );
}