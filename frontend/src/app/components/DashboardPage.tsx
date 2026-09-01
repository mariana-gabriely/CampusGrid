import { useEffect, useState } from "react";
import { Layout } from "./Layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  FileDown,
  Loader2,
  FlaskConical,
  Mic,
  BookOpen,
  CalendarDays,
  FileText
} from "lucide-react";
import { cn } from "./ui/utils";
import { ScrollArea } from "./ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { environmentApi, reservaApi } from "../lib/api";
import { Ambiente } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ReservaAprovada {
  idReserva: string;
  idAmbiente: string;
  nomeAmbiente: string;
  categoriaAmbiente?: string;
  nomeSolicitante: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  observacoes?: string;
  nomeAprovador?: string;
  dataAvaliacao?: string;
  anexoNome?: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [environments, setEnvironments] = useState<Ambiente[]>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("");
  const [loadingEnvs, setLoadingEnvs] = useState(true);
  const [approvedRequests, setApprovedRequests] = useState<ReservaAprovada[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ReservaAprovada | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`);

  useEffect(() => {
    loadEnvironments();
  }, []);

  useEffect(() => {
    loadOcupacao();
  }, [currentDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  async function loadEnvironments() {
    try {
      const data = await environmentApi.listarTodos(true);
      setEnvironments(data);
      if (data.length > 0) setSelectedEnvId(data[0].idAmbiente);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEnvs(false);
    }
  }

  async function loadOcupacao() {
    setLoadingRequests(true);
    try {
      const inicio = weekStart.toISOString();
      const fim = addDays(weekStart, 7).toISOString();
      const data = await reservaApi.ocupacaoNoPeriodo(inicio, fim);
      setApprovedRequests(data);
    } catch (error) {
      console.error("Erro ao carregar ocupação", error);
    } finally {
      setLoadingRequests(false);
    }
  }

  const getTopOffsetInHours = (startDateStr: string) => {
    const date = new Date(startDateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalHours = hours + minutes / 60;
    return Math.max(0, totalHours - 8); // Deslocamento a partir das 8:00
  };

  const getDurationInHours = (startDateStr: string, endDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const durationMs = end.getTime() - start.getTime();
    return Math.max(0.5, durationMs / (1000 * 60 * 60)); // Mínimo 30 min
  };

  const getCategoryIcon = (category: string) => {
    const cat = (category || "").toUpperCase();
    if (cat === "LABORATORIO") return FlaskConical;
    if (cat === "AUDITORIO") return Mic;
    return BookOpen;
  };

  const getCategoryColor = (category: string) => {
    const cat = (category || "").toUpperCase();
    if (cat === "LABORATORIO") {
      return {
        bg: "bg-indigo-50/95 hover:bg-indigo-100/95",
        text: "text-indigo-900 border-indigo-200 border-l-indigo-600",
        badge: "bg-indigo-100 text-indigo-700"
      };
    }
    if (cat === "AUDITORIO") {
      return {
        bg: "bg-purple-50/95 hover:bg-purple-100/95",
        text: "text-purple-900 border-purple-200 border-l-purple-600",
        badge: "bg-purple-100 text-purple-700"
      };
    }
    return {
      bg: "bg-orange-50/95 hover:bg-orange-100/95",
      text: "text-orange-955 border-orange-200 border-l-orange-500",
      badge: "bg-orange-100 text-orange-700"
    };
  };

  const handleGeneratePDF = () => {
    const env = environments.find(e => e.idAmbiente === selectedEnvId);
    if (!env) {
      toast.error("Selecione um ambiente para gerar o PDF");
      return;
    }

    const token = localStorage.getItem("campusgrid_token");
    const inicio = weekStart.toISOString();
    const fim = addDays(weekStart, 7).toISOString();
    
    const downloadUrl = `http://localhost:8080/reservas/ocupacao/pdf?idAmbiente=${env.idAmbiente}&inicio=${inicio}&fim=${fim}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `ocupacao_${env.nomeSala}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Download do relatório iniciado!");
  };

  const selectedEnvironment = environments.find(e => e.idAmbiente === selectedEnvId);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mapa de Ocupação</h1>
            <p className="text-sm text-slate-500">Monitoramento de ambientes em tempo real (apenas reservas aprovadas)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))} className="rounded-none border-r border-slate-100 h-9 w-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-none border-r border-slate-100 px-4 text-xs font-bold uppercase text-slate-700">
                {format(weekStart, "dd/MM")} - {format(addDays(weekStart, 6), "dd/MM")}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))} className="rounded-none h-9 w-9">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {user?.perfil === "SOLICITANTE" ? (
              <Button onClick={() => navigate("/new-request")} className="rounded-md h-9 px-4 font-bold text-xs uppercase bg-primary hover:opacity-90">
                <Plus className="w-3.5 h-3.5 mr-2" /> Nova Reserva
              </Button>
            ) : (
              <Button onClick={handleGeneratePDF} variant="outline" className="rounded-md h-9 px-4 font-bold text-xs uppercase border-slate-200 text-slate-600 hover:bg-slate-50">
                <FileDown className="w-3.5 h-3.5 mr-2" /> Gerar PDF
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs font-bold uppercase text-slate-400">Ambientes ({environments.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[520px]">
                  <div className="space-y-1 pr-2">
                    {loadingEnvs ? (
                      <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : environments.length === 0 ? (
                      <p className="p-4 text-xs text-slate-400 italic text-center">Nenhum ambiente encontrado.</p>
                    ) : (
                      environments.map(env => {
                        const EnvIcon = getCategoryIcon(env.categoria);
                        const isActive = selectedEnvId === env.idAmbiente;
                        return (
                          <button
                            key={env.idAmbiente}
                            onClick={() => setSelectedEnvId(env.idAmbiente)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 transition-all text-left rounded-lg border",
                              isActive 
                                ? "bg-orange-50/70 border-orange-200 text-orange-950 font-semibold shadow-sm" 
                                : "hover:bg-slate-50/70 border-transparent text-slate-600"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={cn(
                                "p-2 rounded-md shrink-0 transition-colors",
                                isActive ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"
                              )}>
                                <EnvIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{env.nomeSala}</p>
                                <p className="text-[10px] opacity-75">Capacidade: {env.capacidade}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {env.exclusivoCurso && (
                                <span className="text-[8px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">
                                  Excl.
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/50 sticky top-0 z-20">
              <div className="p-3.5 border-r border-slate-200 text-[10px] font-bold text-slate-400 flex items-center justify-center uppercase tracking-wider">Hora</div>
              {weekDays.map(day => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toISOString()} className={cn(
                    "p-3 text-center border-r border-slate-200 last:border-r-0",
                    isToday && "bg-orange-50/40"
                  )}>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      isToday ? "text-primary" : "text-slate-400"
                    )}>{format(day, "EEE", { locale: ptBR })}</p>
                    <p className={cn(
                      "text-xl font-extrabold leading-none mt-1.5",
                      isToday ? "text-primary" : "text-slate-800"
                    )}>{format(day, "dd")}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] relative">
              {loadingRequests && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-30">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
              <div className="grid grid-cols-8 relative">
                {/* Time Axis Column */}
                <div className="flex flex-col bg-slate-50/30">
                  {timeSlots.map(time => (
                    <div key={time} className="h-16 p-2 text-right border-b border-slate-100 border-r border-slate-200 flex items-start justify-end pr-3">
                      <span className="text-[10px] font-bold text-slate-400">{time}</span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                  const isToday = isSameDay(day, new Date());
                  const dayRequests = approvedRequests.filter(r => {
                    if (r.idAmbiente !== selectedEnvId) return false;
                    const requestStart = new Date(r.dataInicio);
                    return isSameDay(requestStart, day);
                  });

                  return (
                    <div key={day.toISOString()} className={cn(
                      "flex flex-col border-r border-slate-100 last:border-r-0 relative min-h-[960px]",
                      isToday && "bg-orange-50/5"
                    )}>
                      {/* Grid Line Cells */}
                      {timeSlots.map(time => (
                        <div key={time} className="h-16 border-b border-slate-100" />
                      ))}

                      {/* Current time red line indicator */}
                      {isToday && currentTime.getHours() >= 8 && currentTime.getHours() < 23 && (
                        <div 
                          className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                          style={{
                            top: `${(currentTime.getHours() + currentTime.getMinutes() / 60 - 8) * 64}px`
                          }}
                        >
                          <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                        </div>
                      )}

                      {/* Absolute-Positioned Reservation Cards */}
                      {dayRequests.map(req => {
                        const topOffset = getTopOffsetInHours(req.dataInicio);
                        const duration = getDurationInHours(req.dataInicio, req.dataFim);
                        const colors = getCategoryColor(req.categoriaAmbiente || "");

                        return (
                          <div
                            key={req.idReserva}
                            onClick={() => setSelectedBooking(req)}
                            style={{
                              top: `${topOffset * 64}px`,
                              height: `${duration * 64 - 4}px`
                            }}
                            className={cn(
                              "absolute inset-x-1 rounded-lg border p-2 text-[10px] leading-tight font-semibold shadow-xs z-10 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md cursor-pointer border-l-4",
                              colors.bg,
                              colors.text
                            )}
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold truncate uppercase">{req.nomeSolicitante}</p>
                              <div className="flex items-center gap-1 opacity-80 text-[9px] mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{format(new Date(req.dataInicio), "HH:mm")} - {format(new Date(req.dataFim), "HH:mm")}</span>
                              </div>
                            </div>
                            
                            {duration >= 1.5 && req.observacoes && (
                              <p className="line-clamp-2 text-[9px] font-normal opacity-75 mt-1 italic leading-tight">
                                "{req.observacoes}"
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-1 text-[8px] uppercase tracking-wider font-bold">
                              <span className={cn("px-1.5 py-0.5 rounded font-bold text-[8px]", colors.badge)}>
                                {req.categoriaAmbiente}
                              </span>
                              {req.anexoNome && <span className="text-emerald-600 font-extrabold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">PDF</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Dialog Modal */}
      <Dialog open={selectedBooking !== null} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" /> Detalhes da Reserva
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 pt-4 text-sm text-slate-600">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ambiente</span>
                <p className="text-base font-bold text-slate-900">{selectedBooking.nomeAmbiente}</p>
                <span className="inline-block mt-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                  {selectedBooking.categoriaAmbiente || "Espaço Acadêmico"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solicitante</span>
                  <p className="font-semibold text-slate-800">{selectedBooking.nomeSolicitante}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase mt-0.5">
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data</span>
                  <p className="font-semibold text-slate-800">
                    {format(new Date(selectedBooking.dataInicio), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário</span>
                  <p className="font-semibold text-slate-800">
                    {format(new Date(selectedBooking.dataInicio), "HH:mm")} às {format(new Date(selectedBooking.dataFim), "HH:mm")}
                  </p>
                </div>
              </div>

              {selectedBooking.observacoes && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observações / Justificativa</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100 leading-relaxed italic mt-1">
                    "{selectedBooking.observacoes}"
                  </p>
                </div>
              )}

              {selectedBooking.nomeAprovador && (
                <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <p>Efetivado por: <strong className="text-slate-700">{selectedBooking.nomeAprovador}</strong></p>
                  {selectedBooking.dataAvaliacao && (
                    <p className="mt-0.5">Data de avaliação: {format(new Date(selectedBooking.dataAvaliacao), "dd/MM/yyyy HH:mm")}</p>
                  )}
                </div>
              )}

              {selectedBooking.anexoNome && (
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Documentação Anexa</span>
                  <Button
                    onClick={() => {
                      const downloadUrl = reservaApi.downloadAnexoUrl(selectedBooking.idReserva);
                      window.open(downloadUrl, "_blank");
                    }}
                    variant="outline"
                    className="w-full h-10 border-slate-200 hover:bg-slate-50 text-xs font-bold uppercase text-slate-700 flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" /> Baixar Documento Comprobatório
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

