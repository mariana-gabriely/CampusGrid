import { useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { mockRequests } from "../data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, User, Calendar, MapPin, FileText, AlertCircle, Inbox } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";
import { Label } from "./ui/label";

export function ApprovalPanelPage() {
  const pendingRequests = mockRequests.filter(r => r.status === "pendente");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(pendingRequests[0]?.id || null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const selectedRequest = pendingRequests.find(r => r.id === selectedRequestId);

  const handleApprove = (requestId: string) => {
    toast.success("Solicitação aprovada com sucesso.");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Informe o motivo da recusa.");
      return;
    }
    toast.success("Solicitação recusada.");
    setRejectionReason("");
    setShowRejectForm(false);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel de Aprovação</h1>
          <p className="text-sm text-slate-500">Gestão de solicitações pendentes de efetivação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-slate-200 rounded-md bg-white overflow-hidden flex-1 shadow-sm">
          {/* List Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Inbox className="w-3.5 h-3.5" /> Fila de Espera ({pendingRequests.length})
                </h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="divide-y divide-slate-100">
                    {pendingRequests.map((request) => (
                        <button
                            key={request.id}
                            onClick={() => {
                                setSelectedRequestId(request.id);
                                setShowRejectForm(false);
                            }}
                            className={cn(
                                "w-full text-left p-4 transition-colors",
                                selectedRequestId === request.id 
                                    ? "bg-white border-l-4 border-l-primary shadow-sm" 
                                    : "hover:bg-slate-100 border-l-4 border-l-transparent"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-slate-900 truncate">{request.environmentName}</span>
                                <span className="text-[10px] font-bold text-orange-600">PENDENTE</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{request.requesterName}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Solicitado em {format(new Date(request.createdAt), "dd/MM HH:mm")}</p>
                        </button>
                    ))}
                </div>
            </ScrollArea>
          </div>

          {/* Details Area */}
          <div className="md:col-span-8 lg:col-span-9 bg-white flex flex-col">
            {selectedRequest ? (
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/20">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-slate-900">{selectedRequest.environmentName}</h2>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                    <User className="w-4 h-4" /> {selectedRequest.requesterName}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Período Selecionado</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">{format(new Date(selectedRequest.startDate), "dd/MM/yyyy")}</p>
                                <p className="text-xs text-slate-500">{format(new Date(selectedRequest.startDate), "HH:mm")} - {format(new Date(selectedRequest.endDate), "HH:mm")}</p>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-8">
                        <div className="max-w-2xl space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Requisitos do Ambiente</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Projetor', val: selectedRequest.needsProjector },
                                        { label: 'TV', val: selectedRequest.needsTV },
                                        { label: 'Microfone', val: selectedRequest.needsMicrophone },
                                        { label: 'Acesso Controlado', val: selectedRequest.needsControlledAccess }
                                    ].map(item => (
                                        <div key={item.label} className={cn(
                                            "flex items-center gap-2 p-3 rounded border text-xs font-medium",
                                            item.val ? "bg-orange-50 border-orange-100 text-orange-700" : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", item.val ? "bg-orange-500" : "bg-slate-300")} />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {selectedRequest.attachments.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Arquivos Anexos</h3>
                                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded text-sm">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium text-slate-600">{selectedRequest.attachments[0]}</span>
                                        <Button variant="link" size="sm" className="ml-auto text-xs p-0 h-auto">Baixar PDF</Button>
                                    </div>
                                </section>
                            )}

                            <div className="p-4 bg-amber-50 border-l-4 border-amber-400 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <strong>Atenção:</strong> O sistema detectou que este solicitante atua em múltiplos campi. Certifique-se de que a reserva pertence ao seu território administrativo antes de aprovar.
                                </p>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        {showRejectForm ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Motivo da Recusa</Label>
                                    <Textarea
                                        placeholder="Descreva o motivo para o solicitante..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="rounded-md border-slate-200 resize-none h-24 text-sm"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowRejectForm(false)}>Cancelar</Button>
                                    <Button variant="destructive" className="flex-1 rounded-md font-bold" onClick={handleReject}>Confirmar Recusa</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Button 
                                    className="flex-1 h-12 rounded-md font-bold uppercase text-xs tracking-widest bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => handleApprove(selectedRequest.id)}
                                >
                                    <Check className="w-4 h-4 mr-2" /> Efetivar Reserva
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 rounded-md font-bold uppercase text-xs tracking-widest border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setShowRejectForm(true)}
                                >
                                    <X className="w-4 h-4 mr-2" /> Recusar Pedido
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <Inbox className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Nenhum item selecionado</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}